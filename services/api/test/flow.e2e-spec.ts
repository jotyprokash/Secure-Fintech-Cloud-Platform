import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { SystemService } from './../src/system/system.service';

// Polyfill for BigInt serialization in tests
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

describe('NovaPay Core Flow (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let aliceToken: string;
    let bobToken: string;
    let aliceWalletId: string;
    let bobWalletId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();



        app = moduleFixture.createNestApplication();
        await app.init();
        prisma = app.get(PrismaService);
        const systemService = app.get(SystemService);

        // Cleanup
        await prisma.invoice.deleteMany();
        await prisma.transfer.deleteMany();
        await prisma.ledgerPosting.deleteMany();
        await prisma.ledgerEntry.deleteMany();
        await prisma.ledgerAccount.deleteMany();
        await prisma.wallet.deleteMany();
        await prisma.authIdentity.deleteMany();
        await prisma.kycProfile.deleteMany();
        await prisma.user.deleteMany();

        // Restore System Accounts
        await systemService.ensureSystemAccounts();
    });

    afterAll(async () => {
        await app.close();
    });

    it('1. Register Alice', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: 'alice@example.com', password: 'password123' })
            .expect(201);

        expect(res.body.id).toBeDefined();

        // Login to get token
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'alice@example.com', password: 'password123' })
            .expect(201);

        aliceToken = loginRes.body.access_token;
    });

    it('2. Register Bob', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: 'bob@example.com', password: 'password123' })
            .expect(201);

        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'bob@example.com', password: 'password123' })
            .expect(201);

        bobToken = loginRes.body.access_token;
    });

    it('3. Get Wallet IDs', async () => {
        // Need an endpoint to get my wallet? Or query DB.
        // For test simplicity, query DB.
        const aliceUser = await prisma.user.findUnique({ where: { email: 'alice@example.com' }, include: { wallets: true } });
        const bobUser = await prisma.user.findUnique({ where: { email: 'bob@example.com' }, include: { wallets: true } });

        aliceWalletId = aliceUser.wallets[0].id;
        bobWalletId = bobUser.wallets[0].id;

        expect(aliceWalletId).toBeDefined();
        expect(bobWalletId).toBeDefined();
    });

    it('4. Deposit 1000 USD to Alice', async () => {
        // Deposit is on TransfersController
        await request(app.getHttpServer())
            .post('/transfers/deposit')
            .set('Authorization', `Bearer ${aliceToken}`)
            .send({
                walletId: aliceWalletId,
                amount: 1000,
                currency: 'USD',
                description: 'Test Deposit'
            })
            .expect(201);

        // Verify Balance
        const account = await prisma.ledgerAccount.findFirst({ where: { walletId: aliceWalletId } });
        // Balance should be -1000 (Credit Normal Liability)
        expect(Number(account.balance)).toBe(-1000);
    });

    it('5. Alice transfers 500 USD to Bob', async () => {
        await request(app.getHttpServer())
            .post('/transfers')
            .set('Authorization', `Bearer ${aliceToken}`)
            .send({
                toWalletId: bobWalletId,
                amount: 500,
                currency: 'USD',
                description: 'P2P Transfer',
                idempotencyKey: 'transfer-1'
            })
            .expect(201);

        // Verify Alice Balance (-1000 + 500 = -500)
        const aliceAccount = await prisma.ledgerAccount.findFirst({ where: { walletId: aliceWalletId } });
        expect(Number(aliceAccount.balance)).toBe(-500);

        // Verify Bob Balance (0 - 500 = -500)
        const bobAccount = await prisma.ledgerAccount.findFirst({ where: { walletId: bobWalletId } });
        expect(Number(bobAccount.balance)).toBe(-500);
    });

    it('6. Idempotency Check', async () => {
        await request(app.getHttpServer())
            .post('/transfers')
            .set('Authorization', `Bearer ${aliceToken}`)
            .send({
                toWalletId: bobWalletId,
                amount: 500,
                currency: 'USD',
                description: 'P2P Transfer',
                idempotencyKey: 'transfer-1' // Same Key
            })
            .expect(201); // Should return same success (200/201) but not create new transfer

        // Verify Balances haven't changed
        const aliceAccount = await prisma.ledgerAccount.findFirst({ where: { walletId: aliceWalletId } });
        expect(Number(aliceAccount.balance)).toBe(-500);
    });
});
