import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { queryDTO_User, queryDTO_User_By_Role } from './dto/query-user.dto';
import { Public } from '@/auths/decorator/metadata';
import { Role } from './helpers/utills';
import { Roles } from '@/auths/decorator/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Get()
  // @Roles(Role.Admin)
  // @Public()
  // findAllByRole(@Query() query: queryDTO_User) {
  //   return this.usersService.findAll(query);
  // }

  @Get('by_role')
  @Roles(Role.Admin)
  findAllByRole(@Query() query: queryDTO_User_By_Role) {
    return this.usersService.findAllByRole(query);
  }

  @Get()
  @Public()
  findAll(@Query() query: queryDTO_User) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('show/:id')
  @Public()
  findOneShow(@Param('id') id: string) {
    return this.usersService.findOneShow(id);
  }

  @Patch('me')
  update(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.userId;
    return this.usersService.update(updateUserDto, userId);
  }

  @Patch()
  @Roles(Role.Admin)
  updateUserByAdmin(
    @Query('id') query: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUserByAdmin(updateUserDto, query);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
