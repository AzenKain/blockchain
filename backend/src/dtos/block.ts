import { IsInt, IsNotEmpty, IsOptional, IsString, IsArray, IsDate, Min, IsDateString } from "class-validator";
import { CreateTransactionDto } from "./transaction";

export class CreateBlockDto {
  @IsArray()
  @IsNotEmpty()
  transactions: CreateTransactionDto[];
  
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  blockNumber: number;

  @IsNotEmpty()
  @IsDateString()
  createdDate: Date;

  @IsString()
  @IsNotEmpty()
  blockHash: string;

  @IsString()
  @IsOptional()
  previousBlockHash?: string | null;
}
