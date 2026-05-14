import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  title: string;

  @IsOptional()
  content: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  existingImages?: string[];
}
