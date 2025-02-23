import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { ExternalDocumentProvider } from '../interfaces/external-document-provider.interface';

@Injectable()
export class CloudinaryProvider implements ExternalDocumentProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);

  constructor(private configService: ConfigService) {
    // Initialize Cloudinary with configuration
    cloudinary.config({
      cloud_name: this.configService.getOrThrow('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    try {
      this.logger.debug(`Uploading file ${fileName} to Cloudinary`);

      // Convert buffer to base64
      const base64File = file.toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64File}`;

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload(dataUri, {
          public_id: fileName.split('.')[0], // Remove file extension
          folder: 'processed-images',
          quality: 50, // Compress image
          format: 'jpg', // Convert to jpg
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      this.logger.debug(`File uploaded successfully: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      this.logger.error(`Failed to upload file to Cloudinary: ${error.message}`);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }
} 