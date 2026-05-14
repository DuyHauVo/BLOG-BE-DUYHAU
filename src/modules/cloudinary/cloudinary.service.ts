import { CloudinaryResponse } from "@/utills/interface/cloudinaryResponse";
import { Injectable } from "@nestjs/common";
import { v2 as Cloudinary } from 'cloudinary';  
import streamifier = require("streamifier");

@Injectable()   
export class CloudinaryService {
    uploadImage(file: Express.Multer.File):Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve,reject)=>{
            const uploadimageStream = Cloudinary.uploader.upload_stream(
                (error,result)=>{
                    if (error) return reject(error);
                    resolve(result as CloudinaryResponse)                        
                }
            )
            streamifier.createReadStream(file.buffer).pipe(uploadimageStream)
        })
    }

    async deleteImage(publicId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            Cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }
}
