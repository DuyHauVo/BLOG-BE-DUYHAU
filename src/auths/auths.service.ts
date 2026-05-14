import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePassHelper } from '@/modules/users/helpers/utills';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthsService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) return null;
    const isPasswordMatch = await comparePassHelper(pass, user.password);
    if (!isPasswordMatch) return null;
    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user._id,
      username: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user_ID: user._id,
      role: user.role,
    };
  }

  handleRegister = async (registerDTO: CreateAuthDto) => {
    const user = await this.usersService.handleRegisterFromUser(registerDTO);
    const payload = {
      sub: user._id,
      username: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user_ID: user._id,
      role: user.role,
    };
  };
}
