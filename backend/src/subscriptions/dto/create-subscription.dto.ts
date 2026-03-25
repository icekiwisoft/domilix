import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Premium' })
  @IsString()
  plan_name!: string;

  @ApiProperty({ example: 'campay' })
  @IsString()
  method!: string;

  @ApiProperty({ example: { phone_number: '+237690000000' } })
  payment_info!: any;
}
