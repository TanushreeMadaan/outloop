import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsDateString,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  vendorId: string;

  @IsString()
  departmentId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  itemIds: string[];

  @IsBoolean()
  isReturnable: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsDateString()
  expectedReturnDate?: string;
}
