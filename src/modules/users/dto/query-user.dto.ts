import {
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class queryDTO_User_By_Role {
  @IsNumberString()
  @IsNotEmpty()
  Page: number;

  @IsNumberString()
  @IsNotEmpty()
  currenPage: number;

  @IsString()
  @IsNotIn([null, undefined])
  name: string;
}
export class queryDTO_User {
  @IsOptional()
  Page: number;

  @IsOptional()
  currenPage: number;

  @IsOptional()
  
  name: string;
}
