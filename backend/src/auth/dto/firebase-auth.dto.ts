import { IsNotEmpty, IsString } from 'class-validator';

export class FirebaseAuthDto {
  @IsString()
  @IsNotEmpty()
  id_token!: string;
}
