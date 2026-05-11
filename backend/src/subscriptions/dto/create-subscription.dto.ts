import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Premium' })
  @IsString()
  plan_name!: string;

  @ApiProperty({ example: 'mtn', enum: ['mtn', 'orange', 'mtn_money', 'orange_money'] })
  @IsString()
  method!: string;

  @ApiProperty({ example: { phone_number: '+237690000000' } })
  @Allow()
  payment_info!: any;
}
