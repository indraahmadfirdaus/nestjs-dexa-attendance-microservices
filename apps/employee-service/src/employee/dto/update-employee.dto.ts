import { IsEmail, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be valid' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]*$/, { message: 'Phone number must be valid' })
  phone?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}