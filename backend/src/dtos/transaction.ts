import { IsInt, IsNotEmpty, IsString, IsEnum, IsNumber, Min, IsDate, IsDateString } from 'class-validator';
import { ClaimType } from '../lib/transactions';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  claimNumber: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  settlementAmount: number;

  @IsNotEmpty()
  @IsDateString()
  settlementDate: Date;

  @IsString()
  @IsNotEmpty()
  carRegistration: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  mileage: number;

  @IsEnum(ClaimType)
  @IsNotEmpty()
  claimType: ClaimType;
}
