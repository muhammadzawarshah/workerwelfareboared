import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/, {
    message: 'Password must be at least 12 characters and include uppercase, lowercase, and number',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+92|0)?3[0-9]{9}$/, {
    message: 'Phone number must be a valid Pakistani mobile number',
  })
  phone_number!: string;

  @IsOptional()
  @IsString()
  profile_photo?: string;
}
