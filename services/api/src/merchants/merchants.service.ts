import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class MerchantsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateMerchantDto) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Check if user already has a merchant profile (optional, maybe multiple allowed?)
            // Let's assume one per user for MVP simplicity or check business name uniqueness

            // 2. Create Merchant Wallet
            const wallet = await tx.wallet.create({
                data: {
                    userId, // Merchant wallet linked to user owner
                    currency: 'USD', // Default currency for now
                },
            });

            // 3. Create Income Ledger Account
            await tx.ledgerAccount.create({
                data: {
                    walletId: wallet.id,
                    type: 'INCOME',
                    currency: 'USD',
                    name: `merchant:${dto.businessName}:income`,
                },
            });

            // 4. Create Merchant Profile
            const merchant = await tx.merchant.create({
                data: {
                    userId,
                    businessName: dto.businessName,
                    walletId: wallet.id,
                },
            });

            return merchant;
        });
    }

    async createInvoice(merchantId: string, dto: CreateInvoiceDto) {
        return this.prisma.invoice.create({
            data: {
                merchantId,
                amount: BigInt(dto.amount),
                currency: dto.currency,
                status: 'UNPAID',
            },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.merchant.findFirst({
            where: { userId },
            include: { wallet: true },
        });
    }

    async findAll() {
        return this.prisma.merchant.findMany();
    }
}
