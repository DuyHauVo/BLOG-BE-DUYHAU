import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class queryDTO_Post_Role {
  @IsNumberString({}, { message: `phải là chuỗi "abc21" ` })
  @IsNotEmpty()
  Page: number | string;

  @IsNumberString({}, { message: `phải là chuỗi "abc21" ` })
  @IsNotEmpty()
  currenPage: number | string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;
}

export class queryDTO_Post {
  @IsOptional()
  Page: number | string;

  @IsOptional()
  currenPage: number | string;

  @IsOptional()
  name: string;

  @IsOptional()
  author?: string;
}
