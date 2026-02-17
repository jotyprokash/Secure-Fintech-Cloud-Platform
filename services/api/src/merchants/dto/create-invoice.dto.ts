
import { IsString, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateInvoiceDto {
    @IsNumber()
    @Min(1)
    amount: number;

    @IsString()
    @IsNotEmpty()
    currency: string;
}
