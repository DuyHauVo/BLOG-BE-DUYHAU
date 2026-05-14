import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title Ko được để trống' })
  title: string;

  @IsOptional()
  content: string;

  @IsOptional()
  images: string[];
}
