import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  childId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}

export class ConfirmPaymentDto {
  @IsString()
  paymentId: string;

  @IsOptional()
  @IsString()
  proofUrl?: string;
}
