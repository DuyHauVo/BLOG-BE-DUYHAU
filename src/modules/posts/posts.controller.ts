import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Request,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AllowAny, Public } from '@/auths/decorator/metadata';
import { JwtAuthGuard } from '@/auths/passport/jwt-auth.guard';
import { queryDTO_Post, queryDTO_Post_Role } from './dto/query-post.dto';
import { Roles } from '@/auths/decorator/roles.decorator';
import { Role } from '../users/helpers/utills';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  // sử dụng UseInterceptors để nhận nhiều ảnh, images đc gửi từ FE
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Req() req: any,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[], // mảng nhận file (ảnh)
  ) {
    const user_id = req.user.userId;
    return this.postsService.create(createPostDto, user_id, files);
  }

  @Get('/role')
  @Roles(Role.Admin, Role.User)
  findAllByRole(@Query() queryDTO: queryDTO_Post_Role, @Req() req: any) {
    const user = req.user;
    return this.postsService.findAllByRole(queryDTO, user);
  }

  @Get('/my-posts')
  @UseGuards(JwtAuthGuard)
  findMyPosts(@Query() queryDTO: queryDTO_Post, @Req() req: any) {
    const user_id = req.user.userId;
    return this.postsService.findMyPosts(queryDTO, user_id);
  }

  @Get()
  @Public()
  findAll(@Query() queryDTO: queryDTO_Post) {
    return this.postsService.findAll(queryDTO);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch()
  @Roles(Role.Admin, Role.User)
  @UseInterceptors(FilesInterceptor('images')) // Hỗ trợ upload ảnh khi cập nhật
  update(
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
    @Query('id') postId: string,
    @UploadedFiles() files: Express.Multer.File[], // Nhận file ảnh mới nếu có
  ) {
    const user = req.user;
    return this.postsService.update(updatePostDto, user, postId, files);
  }

  @Delete()
  @Roles(Role.Admin, Role.User)
  remove(@Req() req: any, @Query('id') postId: string) {
    return this.postsService.remove(postId, req.user);
  }
}
