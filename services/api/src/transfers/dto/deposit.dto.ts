import { IsString, IsNotEmpty, IsUUID, IsNumber, IsPositive } from 'class-validator';

export class DepositDto {
    @IsUUID()
    @IsNotEmpty()
    walletId: string;

    @IsNumber()
    @IsPositive()
    amount: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
