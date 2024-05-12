import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { cloudinary } from 'src/utils/cloudinary';

@Module({
  imports: [
    // MulterModule.registerAsync({
    //   useFactory: () => ({
    //     storage: new CloudinaryStorage({
    //       cloudinary: cloudinary,
    //       params: {
    //         folder: 'file-upload', // Specify the folder where you want to store images
    //         allowed_formats: ['jpg', 'jpeg', 'png'], // Specify allowed file formats
    //         public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Specify the file name
    //       },
    //     } as any),
    //   }),
    // }),
    MulterModule.register({
      dest: './upload',
    }),
  ],
  exports: [MulterModule],
})
export class MulterConfigModule {}
