import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvService } from './csv.service';
import { ImageProcessingService } from '../image-processing/image-processing.service';
import { UploadCsvDto } from '../../common/dto/upload-csv.dto';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('csv')
export class CsvController {
  constructor(
    private readonly csvService: CsvService,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname +
              '-' +
              uniqueSuffix +
              path.extname(file.originalname),
          );
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadCsvDto: UploadCsvDto,
  ) {
    const processingRequest = await this.csvService.processCSV(
      file,
      uploadCsvDto.webhookUrl,
    );

    // Start image processing in the background
    this.imageProcessingService.processImages(processingRequest.id);

    return {
      requestId: processingRequest.id,
      message: 'CSV file uploaded successfully. Processing started.',
    };
  }

  @Get('status/:requestId')
  async getStatus(@Param('requestId') requestId: string) {
    return this.csvService.getProcessingStatus(requestId);
  }
}
