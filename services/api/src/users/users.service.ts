import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@novapay/database';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async createUserWithWallet(email: string, passwordHash: string): Promise<User> {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                },
            });

            const wallet = await tx.wallet.create({
                data: {
                    userId: user.id,
                    currency: 'USD', // Default currency
                },
            });

            // Create a Liability account for the user's wallet (platform owes user money)
            await tx.ledgerAccount.create({
                data: {
                    walletId: wallet.id,
                    type: 'LIABILITY',
                    currency: 'USD',
                    name: `user:${user.id}:main`,
                },
            });

            return user;
        });
    }
}
