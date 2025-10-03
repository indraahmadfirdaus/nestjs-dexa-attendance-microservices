import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateEmployeeDto {
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Position is required' })
  position: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]*$/, { message: 'Phone number must be valid' })
  phone?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}