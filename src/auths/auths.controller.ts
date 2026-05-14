import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from './decorator/metadata';
import { Roles } from './decorator/roles.decorator';
import { Role } from '@/modules/users/helpers/utills';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Public()
  handleLogin(@Req() req: any) {
    return this.authsService.login(req.user);
  }

  @Post('register')
  @Public()
  Register(@Body() registerDTO: CreateAuthDto) {
    return this.authsService.handleRegister(registerDTO);
  }

  @Get('profiles')
  @Roles(Role.Admin)
  getProfile(@Req() req: any) {
    return req.user;
  }
}
