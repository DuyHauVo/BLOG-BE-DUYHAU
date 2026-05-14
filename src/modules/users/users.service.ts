import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { hashPassHelper } from './helpers/utills';
import { CreateAuthDto } from '@/auths/dto/create-auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<User>,
  ) {}

  CheckEmail = async (email: string) => {
    const user = await this.UserModel.exists({ email });
    if (user) return true;
    return false;
  };

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, age } = createUserDto;

    const existUserCheck = await this.CheckEmail(email);
    if (existUserCheck === true) {
      throw new BadRequestException(`Email đã tồn tại`);
    }

    const hashPassWord = await hashPassHelper(password);
    const user = await this.UserModel.create({
      name,
      email,
      password: hashPassWord,
      age,
    });

    return {
      _id: user._id,
    };
  }

  async findAll(query: any) {
    const { filter, sort } = aqp(query);

    if (filter.currenPage) delete filter.currenPage;
    if (filter.Page) delete filter.Page;
    if (filter.name) delete filter.name;

    const TotalItems = (await this.UserModel.find(filter)).length;
    const TotalPages = Math.ceil(TotalItems / query.currenPage);
    const skip = (query.Page - 1) * query.currenPage;

    const results = await this.UserModel.find(filter)
      .limit(query.currenPage)
      .skip(skip)
      .select('-password')
      .sort(sort as any); //Tìm kiếm sắp xếp theo thứ tự

    return { results, TotalPages };
  }

  async findAllByRole(query: any) {
    const { filter, sort } = aqp(query);

    if (filter.currenPage) delete filter.currenPage;
    if (filter.Page) delete filter.Page;
    if (filter.name) delete filter.name;

    const TotalItems = (await this.UserModel.find(filter)).length;
    const TotalPages = Math.ceil(TotalItems / query.currenPage);
    const skip = (query.Page - 1) * query.currenPage;

    const results = await this.UserModel.find(filter)
      .limit(query.currenPage)
      .skip(skip)
      .select('-password')
      .sort(sort as any); //Tìm kiếm sắp xếp theo thứ tự

    return { results, TotalPages };
  }

  async findOne(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return await this.UserModel.findById({ _id }).select('-password');
    } else {
      throw new BadRequestException('ID KO ĐÚNG ĐỊNH DẠNG');
    }
  }
  async findOneShow(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return await this.UserModel.findById({ _id }).select('-password');
    } else {
      throw new BadRequestException('ID KO ĐÚNG ĐỊNH DẠNG');
    }
  }

  async findByEmail(email: string) {
    return await this.UserModel.findOne({ email });
  }

  // async update(
  //   updateUserDto: UpdateUserDto,
  //   user: any, //user Đang đăng nhập
  //   user_Id_Client: string, //id user chỉnh sửa
  // ) {
  //   const cleanId = user_Id_Client.trim();
  //   const targetUser = await this.findOne(cleanId);

  //   if (!targetUser) {
  //     throw new NotFoundException('KO tồn tại user');
  //   }

  //   if (user.role !== 'ADMIN') {
  //     throw new NotFoundException('Bạn ko có quyền chỉnh sửa nội dung này');
  //   }
  //   return await this.UserModel.updateOne(
  //     { _id: user_Id_Client },
  //     { ...updateUserDto },
  //   );
  // }
  async update(updateUserDto: UpdateUserDto, userID: string) {
    if (updateUserDto.email) {
      const emailOwner = await this.UserModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: userID },
      });

      if (emailOwner) {
        throw new BadRequestException(`Email da ton tai`);
      }
    }

    return await this.UserModel.updateOne(
      { _id: userID },
      { ...updateUserDto },
    );
  }
  async updateUserByAdmin(updateUserDto: UpdateUserDto, userID: string) {
    return await this.UserModel.updateOne(
      { _id: userID },
      { ...updateUserDto },
    );
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return await this.UserModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('Id KO ĐÚNG ĐỊNH DẠNG');
    }
  }

  async handleRegisterFromUser(registerDTO: CreateAuthDto) {
    // check mail
    const { name, email, password } = registerDTO;

    const existUserCheck = await this.CheckEmail(email);
    if (existUserCheck === true) {
      throw new BadRequestException(`Email đã tồn tại`);
    }

    // hash
    const hashPassWord = await hashPassHelper(password);
    const user = await this.UserModel.create({
      name,
      email,
      password: hashPassWord,
    });

    // res
    return {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
  }
}
