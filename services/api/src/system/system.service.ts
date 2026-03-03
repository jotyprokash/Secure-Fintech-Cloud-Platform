import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerAccountType } from '@novapay/database';

@Injectable()
export class SystemService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.ensureSystemAccounts();
    }

    async ensureSystemAccounts() {
        // Ensure we have a BANK_ASSET account for USD
        const bankAccount = await this.prisma.ledgerAccount.findFirst({
            where: { name: 'system:bank:usd' },
        });

        if (!bankAccount) {
            await this.prisma.ledgerAccount.create({
                data: {
                    name: 'system:bank:usd',
                    type: LedgerAccountType.ASSET,
                    currency: 'USD',
                    balance: BigInt(0), // Asset accounts start at 0, increase via debit postings on deposits
                },
            });
        }

        // Ensure we have a REVENUE_INCOME account
        const revenueAccount = await this.prisma.ledgerAccount.findFirst({
            where: { name: 'system:revenue:usd' },
        });

        if (!revenueAccount) {
            await this.prisma.ledgerAccount.create({
                data: {
                    name: 'system:revenue:usd',
                    type: LedgerAccountType.INCOME,
                    currency: 'USD',
                },
            });
        }
    }

    async getBankAssetAccount(currency: string) {
        return this.prisma.ledgerAccount.findFirstOrThrow({
            where: { name: `system:bank:${currency.toLowerCase()}` },
        });
    }
}
