import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { LedgerAccount, LedgerEntry, LedgerPostingDirection, Prisma } from '@novapay/database';

@Injectable()
export class LedgerService {
    constructor(private prisma: PrismaService) { }

    async createEntry(dto: CreateLedgerEntryDto, externalTx?: Prisma.TransactionClient): Promise<LedgerEntry> {
        const { postings } = dto;

        // 1. Validate Double Entry
        let balance = BigInt(0);
        for (const p of postings) {
            const amount = BigInt(p.amount);
            if (p.direction === LedgerPostingDirection.DEBIT) {
                balance += amount;
            } else {
                balance -= amount;
            }
        }

        if (balance !== BigInt(0)) {
            throw new BadRequestException('Ledger postings do not balance. Sum must be 0.');
        }

        // 2. Transactional Write
        // If external transaction is provided, use it. Otherwise, create a new transaction.
        const execute = async (tx: Prisma.TransactionClient) => {
            // Create Entry
            const entry = await tx.ledgerEntry.create({
                data: {
                    type: dto.type,
                    description: dto.description,
                    metadata: dto.metadata || Prisma.DbNull,
                },
            });

            // Create Postings and Update Account Balances
            for (const p of postings) {
                await tx.ledgerPosting.create({
                    data: {
                        entryId: entry.id,
                        accountId: p.accountId,
                        amount: p.amount,
                        direction: p.direction,
                    },
                });

                const account = await tx.ledgerAccount.findUniqueOrThrow({ where: { id: p.accountId } });

                // DEBIT adds to balance, CREDIT subtracts
                let delta = BigInt(p.amount);
                if (p.direction === LedgerPostingDirection.CREDIT) {
                    delta = -delta;
                }

                await tx.ledgerAccount.update({
                    where: { id: p.accountId },
                    data: {
                        balance: {
                            increment: delta,
                        },
                    },
                });
            }

            return entry;
        };

        if (externalTx) {
            return execute(externalTx);
        } else {
            return this.prisma.$transaction(execute);
        }
    }

    async getAccountBalance(accountId: string, externalTx?: Prisma.TransactionClient): Promise<bigint> {
        const client = externalTx || this.prisma;
        const account = await client.ledgerAccount.findUnique({
            where: { id: accountId },
        });
        return account ? account.balance : BigInt(0);
    }
}
