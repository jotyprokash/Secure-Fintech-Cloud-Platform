import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Transfer, LedgerPostingDirection, LedgerEntryType, Prisma, LedgerAccount } from '@novapay/database';

import { SystemService } from '../system/system.service';
import { DepositDto } from './dto/deposit.dto';

@Injectable()
export class TransfersService {
    constructor(
        private prisma: PrismaService,
        private ledgerService: LedgerService,
        private systemService: SystemService,
    ) { }

    async deposit(dto: DepositDto) {
        const { walletId, amount, currency, description } = dto;
        const amountBg = BigInt(amount);

        return this.prisma.$transaction(async (tx) => {
            // 1. Get User Wallet Account
            const userAccount = await this.getWalletAccount(tx, walletId, 'LIABILITY');
            if (!userAccount) {
                throw new NotFoundException('User wallet account not found');
            }

            // 2. Get Bank Asset Account (System)
            // We can't access SystemService via tx easily if it uses this.prisma.
            // But SystemService.getBankAssetAccount uses this.prisma.
            // We should probably just query it directly or allow SystemService to take tx.
            // Let's query directly for now or fix SystemService?
            // SystemService accounts are stable, we can query safely without tx lock usually, 
            // but strictly we should use tx.
            // Let's find it manually here to be safe with tx.
            const bankAccount = await tx.ledgerAccount.findFirst({
                where: { name: `system:bank:${currency.toLowerCase()}` },
            });

            if (!bankAccount) {
                throw new BadRequestException('System bank account not found for currency');
            }

            // 3. Create Ledger Entry
            // Debit Bank (Asset +), Credit User (Liability +)
            const entry = await this.ledgerService.createEntry(
                {
                    type: LedgerEntryType.DEPOSIT,
                    description: description || `Deposit to ${walletId}`,
                    postings: [
                        {
                            accountId: bankAccount.id,
                            amount: Number(amountBg),
                            direction: LedgerPostingDirection.DEBIT,
                        },
                        {
                            accountId: userAccount.id,
                            amount: Number(amountBg),
                            direction: LedgerPostingDirection.CREDIT,
                        },
                    ],
                },
                tx,
            );

            return entry;
        });
    }

    async createTransfer(userId: string, dto: CreateTransferDto): Promise<Transfer> {
        const { toWalletId, amount, currency, idempotencyKey, description } = dto;
        const amountBg = BigInt(amount);

        if (amountBg <= 0) {
            throw new BadRequestException('Amount must be positive');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Idempotency Check
            const existingTransfer = await tx.transfer.findUnique({
                where: { idempotencyKey },
            });
            if (existingTransfer) {
                return existingTransfer;
            }

            // 2. Get User's Wallet (Assuming Single Wallet per User for MVP or we query by Currency?)
            // We need the wallet that holds this currency.
            // DTO doesn't specify FromWalletId, so we find it.
            const fromWallet = await tx.wallet.findFirst({
                where: { userId, currency },
            });

            if (!fromWallet) {
                throw new BadRequestException(`User has no wallet for currency ${currency}`);
            }

            // 3. Get Receiver Wallet
            const toWallet = await tx.wallet.findUnique({
                where: { id: toWalletId },
            });

            if (!toWallet) {
                throw new NotFoundException('Receiver wallet not found');
            }

            if (toWallet.currency !== currency) {
                throw new BadRequestException('Currency mismatch');
            }

            if (fromWallet.id === toWallet.id) {
                throw new BadRequestException('Cannot transfer to same wallet');
            }

            // 4. Get Ledger Accounts
            const fromAccount = await this.getWalletAccount(tx, fromWallet.id, 'LIABILITY');
            const toAccount = await this.getWalletAccount(tx, toWallet.id, 'LIABILITY');

            if (!fromAccount || !toAccount) {
                throw new BadRequestException('Ledger accounts not found');
            }

            // 5. Check Balance
            // Liability Balance is Negative. e.g. -100.
            // We need to ensure we have enough funds.
            // Current Balance: -100.
            // Transfer Amount: 50.
            // We check if Abs(Balance) >= Amount. Since Balance is <= 0.
            // -Balance >= Amount.
            // OR Balance <= -Amount.
            const currentBalance = await this.ledgerService.getAccountBalance(fromAccount.id, tx);

            // Strict check: Balance must be <= -Amount.
            // e.g. -100 <= -50 (True). -10 <= -50 (False).
            if (currentBalance > -amountBg) {
                throw new BadRequestException('Insufficient funds');
            }

            // 6. Create Transfer Record (PENDING)
            const transfer = await tx.transfer.create({
                data: {
                    fromWalletId: fromWallet.id,
                    toWalletId: toWallet.id,
                    amount: amountBg,
                    currency,
                    status: 'PENDING',
                    idempotencyKey,
                },
            });

            // 7. Create Ledger Entry
            // Sender = DEBIT (Decrease Liability / Move towards 0 / Less negative / "Pay out")
            // Receiver = CREDIT (Increase Liability / Move away from 0 / More negative / "Receive in")
            const entry = await this.ledgerService.createEntry(
                {
                    type: LedgerEntryType.TRANSFER,
                    description: description || `Transfer from ${fromWallet.id} to ${toWallet.id}`,
                    metadata: { transferId: transfer.id },
                    postings: [
                        {
                            accountId: fromAccount.id,
                            amount: Number(amountBg), // DTO expects number? Our LedgerService expects amount in DTO.
                            direction: LedgerPostingDirection.DEBIT,
                        },
                        {
                            accountId: toAccount.id,
                            amount: Number(amountBg),
                            direction: LedgerPostingDirection.CREDIT,
                        },
                    ],
                },
                tx,
            );

            // 8. Update Transfer to COMPLETED and Link Entry
            return tx.transfer.update({
                where: { id: transfer.id },
                data: {
                    status: 'COMPLETED',
                    ledgerEntryId: entry.id,
                },
            });
        });
    }

    async getTransferHistory(userId: string) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId },
            select: { id: true },
        });
        const walletIds = wallets.map((w) => w.id);

        const transfers = await this.prisma.transfer.findMany({
            where: {
                OR: [
                    { fromWalletId: { in: walletIds } },
                    { toWalletId: { in: walletIds } },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                fromWallet: {
                    include: { user: { select: { email: true } } }
                },
                toWallet: {
                    include: { user: { select: { email: true } } }
                }
            }
        });

        return transfers.map((t) => {
            const isSender = walletIds.includes(t.fromWalletId);
            return {
                id: t.id,
                amount: t.amount.toString(),
                currency: t.currency,
                status: t.status,
                direction: isSender ? 'SENT' : 'RECEIVED',
                counterparty: isSender ? t.toWallet.user?.email || 'Unknown' : t.fromWallet.user?.email || 'System',
                createdAt: t.createdAt,
            };
        });
    }

    private async getWalletAccount(tx: Prisma.TransactionClient, walletId: string, type: 'LIABILITY' | 'ASSET') {
        return tx.ledgerAccount.findFirst({
            where: { walletId, type },
        });
    }
}
