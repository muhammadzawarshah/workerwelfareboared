import {IsNotEmpty,IsEmail,IsString,minLength} from 'class-validator';

export class logindto{
    @IsEmail()
    @IsNotEmpty()
    email!:string;

    @IsNotEmpty()
    @IsString()
    password!:String;
}

