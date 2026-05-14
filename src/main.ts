import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // <-- thêm dòng này để dùng Swagger
import { RolesGuard } from './auths/passport/roles.guard';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Tự động validate dữ liệu từ client gửi lên
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ các field không khai báo trong DTO
    }),
  );

  // chia role giống với guard jwt khai báo trong app.module.ts {provide: APP_GUARD,useClass: RolesGuard,}
  app.useGlobalGuards(new RolesGuard(new Reflector()));

  // Đặt tiền tố /api cho tất cả route (trừ trang chủ '/')
  app.setGlobalPrefix('api', { exclude: [''] });

  //cho pheps chayj ren post khac
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Cho phép FE truy cập
    credentials: true, // Nếu có dùng cookie
  });

  // ========== ⚙️ Thêm phần cấu hình Swagger ==========
  const config = new DocumentBuilder()
    .setTitle('Tài liệu API cho hệ thống EatBacon') // tiêu đề tài liệu Swagger
    .setDescription('Swagger mô tả các API trong backend của bạn')
    .setVersion('1.0')
    .addBearerAuth() // nếu bạn có dùng JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // tạo trang http://localhost:7777/api-docs

  await app.listen(process.env.PORT ?? 7778); // Port mặc định
}
bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // auto validation của nestJS
//   app.useGlobalPipes(
//     new ValidationPipe({
//       // kiểm tra user nhập vào bị thừa hay ko
//       whitelist: true,
//     }),
//   );

//   //  Thêm version (path: api)cho các page. ex: http://localhost:7777/api/user
//   //  { exclude: ['']} : trả về trang chủ ko cần path /api. ex: http://localhost:7777
//   app.setGlobalPrefix('api', { exclude: [''] });
//   await app.listen(process.env.PORT ?? 7778);
// }
// bootstrap();
