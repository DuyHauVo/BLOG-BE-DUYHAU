import { v2 as Cloudinary } from 'cloudinary'
export const CloudinaryProvider = [
    {   
        // Đặt nickname cho object
        provide: 'CLOUDINARY',
        // Hàm để tạo object đó => dựa vào provide sử dụng mọi nơi
        useFactory: () => {
            return Cloudinary.config({
                cloud_name: process.env.CLOUDINARY_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
        },
    },
]