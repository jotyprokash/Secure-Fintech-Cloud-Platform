import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsPositive } from 'class-validator';

export class CreateTransferDto {
    @IsUUID()
    @IsNotEmpty()
    toWalletId: string;

    @IsNumber()
    @IsPositive()
    amount: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsString()
    @IsNotEmpty()
    idempotencyKey: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
