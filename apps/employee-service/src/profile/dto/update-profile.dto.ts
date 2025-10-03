import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]*$/, { message: 'Phone number must be valid' })
  phone?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}