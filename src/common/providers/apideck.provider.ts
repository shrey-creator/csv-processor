import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Apideck } from '@apideck/node';

@Injectable()
export class ApideckProvider {
  private readonly logger = new Logger(ApideckProvider.name);
  private readonly apideck: Apideck;

  constructor(private configService: ConfigService) {
    this.apideck = new Apideck({
      apiKey: this.configService.getOrThrow('APIDECK_API_KEY'),
      appId: this.configService.getOrThrow('APIDECK_APP_ID'),
      consumerId: this.configService.getOrThrow('APIDECK_CONSUMER_ID'),
    });
  }

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    const uploadedFile = await this.apideck.utils.uploadFile({
      serviceId: 'onedrive',
      file: file, // Buffer | string
      name: fileName,
      size: file.length, // file size in bytes
    });

    console.log(uploadedFile);
    return 'https://www.google.com';
  }

} 