import { IsInt, IsNotEmpty, IsString, IsEnum, IsNumber, Min, IsDate, IsDateString } from 'class-validator';
export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  studentCode: string;
  
  @IsString()
  @IsNotEmpty()
  subjectCode: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  mark: number;

  @IsNotEmpty()
  @IsDateString()
  timestamp: Date;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  nMark: number;
}
