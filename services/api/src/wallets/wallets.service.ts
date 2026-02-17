import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletsService {
    constructor(private prisma: PrismaService) { }

    async getUserWallets(userId: string) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId },
            include: {
                accounts: true, // Should exist if schema is correct
            },
        });

        return wallets.map((wallet) => {
            // Find the liability account (User Wallet Account)
            const account = wallet.accounts.find((acc) => acc.type === 'LIABILITY');

            // Balance logic: Liability accounts are Credit Normal (Negative Balance).
            // So -100 means user has 100.
            // We return positive balance for UI.
            const rawBalance = account ? BigInt(account.balance) : BigInt(0);
            const balance = rawBalance * BigInt(-1);

            return {
                id: wallet.id,
                currency: wallet.currency,
                balance: balance.toString(), // Convert to string for JSON
            };
        });
    }
}
