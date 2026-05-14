import { CloudinaryService } from './../cloudinary/cloudinary.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<Post>,
    private CloudinaryService: CloudinaryService,
  ) {}

  private extractPublicId(url: string): string | null {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
      // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id].[ext]
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      const publicIdWithExt = lastPart.split('.')[0];
      
      // Nếu có thư mục, public_id sẽ nằm sau phần 'upload/v[version]/'
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && parts[uploadIndex + 1]?.startsWith('v')) {
        // Lấy tất cả các phần tử từ sau version đến trước file name
        const folderParts = parts.slice(uploadIndex + 2, parts.length - 1);
        if (folderParts.length > 0) {
          return [...folderParts, publicIdWithExt].join('/');
        }
      }
      return publicIdWithExt;
    } catch (error) {
      return null;
    }
  }

  async create(
    createPostDto: CreatePostDto,
    user_id: string,
    files: Express.Multer.File[],
  ) {
    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      const uploadPromise = files.map((file) =>
        this.CloudinaryService.uploadImage(file),
      );
      const uploadResult = await Promise.all(uploadPromise);
      imageUrls = uploadResult.map((result) => result.secure_url);
    }
    const createNewPost = new this.PostModel({
      ...createPostDto,
      images: imageUrls,
      author: user_id,
    });

    return await createNewPost.save();
  }

  async findAllByRole(query: any, user: any) {
    const { filter, sort } = aqp(query);

    if (user.role?.includes('USERS')) {
      filter.author = user.userId;
    }

    if (filter.Page) delete filter.Page;
    if (filter.currenPage) delete filter.currenPage;

    if (typeof filter.name === 'string') {
      if (filter.name.trim() !== '') {
        filter.title = { $regex: filter.name.trim(), $options: 'i' };
      }
      delete filter.name;
    }

    const TotalItems = (await this.PostModel.find(filter)).length;
    const TotalPages = Math.ceil(TotalItems / query.currenPage);
    const skip = (query.Page - 1) * query.currenPage;

    const results = await this.PostModel.find(filter)
      .skip(skip)
      .limit(query.currenPage)
      .sort(sort as any);

    return { results, TotalPages };
  }

  async findMyPosts(query: any, user_id: string) {
    const { filter, sort } = aqp(query);

    // Gán author trực tiếp bằng string ID, Mongoose sẽ tự convert
    filter.author = user_id;

    // Xóa các field phân trang khỏi filter để tránh lỗi query
    if (filter.Page) delete filter.Page;
    if (filter.currenPage) delete filter.currenPage;

    // Xử lý tìm kiếm theo tên nếu có
    if (typeof filter.name === 'string') {
      if (filter.name.trim() !== '') {
        filter.title = { $regex: filter.name.trim(), $options: 'i' };
      }
      delete filter.name;
    }

    const limitNum = Number(query.currenPage) || 10;
    const pageNum = Number(query.Page) || 1;
    const skip = (pageNum - 1) * limitNum;

    // Sử dụng countDocuments để đếm tổng số bài viết của user này
    const TotalItems = await this.PostModel.countDocuments(filter);
    const TotalPages = Math.ceil(TotalItems / limitNum);

    const results = await this.PostModel.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort(sort as any);

    return { results, TotalPages };
  }
  async findAll(query: any) {
    const { filter, sort } = aqp(query);

    if (filter.Page) delete filter.Page;
    if (filter.currenPage) delete filter.currenPage;
    if (typeof filter.name === 'string' && filter.name.trim() !== '') {
      filter.title = { $regex: filter.name, $options: 'i' };
    }
    delete filter.name;

    const TotalItems = await this.PostModel.countDocuments(filter); //dùng countDocuments đến length nhanh hơn và đỡ tôn RAM thay vì find().length
    const TotalPages = Math.ceil(TotalItems / query.currenPage);
    const skip = (query.Page - 1) * query.currenPage;

    const results = await this.PostModel.find(filter)
      .skip(skip)
      .limit(query.currenPage)
      .sort(sort as any);

    return { results, TotalPages };
  }

  async findOne(id: string) {
    if (mongoose.isValidObjectId(id)) {
      return await this.PostModel.findById(id);
    } else {
      throw new BadRequestException('ID KO ĐÚNG ĐỊNH DẠNG');
    }
  }

  async update(
    updatePostDto: UpdatePostDto,
    user: any,
    postId: string,
    files?: Express.Multer.File[],
  ) {
    const post = await this.PostModel.findById(postId);
    const user_ID = user.userId;

    if (!post) {
      throw new NotFoundException('Bài viết ko tồn tại');
    }

    if (user.role !== 'ADMIN' && post.author.toString() !== user_ID) {
      throw new NotFoundException('Bạn ko có quyền chỉnh sửa nội dung này');
    }

    // Xử lý ảnh cũ bị xóa
    const currentImages = post.images || [];
    const imagesToKeep = updatePostDto.existingImages || [];
    const imagesToDelete = currentImages.filter(img => !imagesToKeep.includes(img));

    // Xóa ảnh cũ khỏi Cloudinary
    for (const imgUrl of imagesToDelete) {
      const publicId = this.extractPublicId(imgUrl);
      if (publicId) {
        await this.CloudinaryService.deleteImage(publicId).catch(err => 
          console.error(`Lỗi khi xóa ảnh ${publicId} trên Cloudinary:`, err)
        );
      }
    }

    // Xử lý upload ảnh mới nếu có
    let newImageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromise = files.map((file) =>
        this.CloudinaryService.uploadImage(file),
      );
      const uploadResult = await Promise.all(uploadPromise);
      newImageUrls = uploadResult.map((result) => result.secure_url);
    }

    // Danh sách ảnh cuối cùng = Ảnh cũ giữ lại + Ảnh mới upload
    const finalImageUrls = [...imagesToKeep, ...newImageUrls];

    await this.PostModel.updateOne(
      { _id: postId },
      {
        ...updatePostDto,
        images: finalImageUrls,
      },
    );

    return { message: 'Update thành công' };
  }

  async remove(postId: string, user: any) {
    const post = await this.PostModel.findById(postId);
    const user_ID = user.userId;
    if (!post) {
      throw new NotFoundException('Bài viết ko tồn tại');
    }

    if (user.role !== 'ADMIN' && post.author.toString() !== user_ID) {
      throw new NotFoundException('Bạn ko có quyền chỉnh sửa nội dung này');
    }

    // Xóa tất cả ảnh trên Cloudinary trước khi xóa bài viết
    const imagesToDelete = post.images || [];
    for (const imgUrl of imagesToDelete) {
      const publicId = this.extractPublicId(imgUrl);
      if (publicId) {
        await this.CloudinaryService.deleteImage(publicId).catch(err => 
          console.error(`Lỗi khi xóa ảnh ${publicId} trên Cloudinary khi xóa bài viết:`, err)
        );
      }
    }

    await this.PostModel.deleteOne({ _id: postId });

    return { message: 'Delete thành công' };
  }
}
