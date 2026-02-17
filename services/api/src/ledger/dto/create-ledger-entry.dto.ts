import { IsString, IsNotEmpty, IsEnum, IsOptional, ValidateNested, IsUUID, IsNumber, IsPositive, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LedgerEntryType, LedgerPostingDirection } from '@novapay/database';

export class LedgerPostingDto {
    @IsUUID()
    @IsNotEmpty()
    accountId: string;

    @IsInt() // BigInt validation is tricky in JSON, let's assume it comes as number or string and we transform it?
    // Actually, usually money comes as string to avoid precision loss, but for this DTO let's accept positive integer number.
    // Better: IsPositive() check.
    @Min(1)
    amount: number;

    @IsEnum(LedgerPostingDirection)
    direction: LedgerPostingDirection;
}

export class CreateLedgerEntryDto {
    @IsEnum(LedgerEntryType)
    type: LedgerEntryType;

    @IsString()
    description: string;

    @IsOptional()
    metadata?: Record<string, any>;

    @ValidateNested({ each: true })
    @Type(() => LedgerPostingDto)
    postings: LedgerPostingDto[];
}
