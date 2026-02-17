import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { LedgerModule } from './ledger/ledger.module';
import { TransfersModule } from './transfers/transfers.module';
import { SystemModule } from './system/system.module';
import { WalletsModule } from './wallets/wallets.module';
import { MerchantsModule } from './merchants/merchants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SystemModule,
    AuthModule,
    UsersModule,
    LedgerModule,
    TransfersModule,
    WalletsModule,
    MerchantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
