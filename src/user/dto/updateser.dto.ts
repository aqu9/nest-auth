import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class updateUserDTO {
  @IsEmail()
  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  fullname: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  phone: string;

  @IsOptional()
  @IsString()
  address: string;
}

// export class signupResonse {
//   message: string;

//   email: string;
// }
