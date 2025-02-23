import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ProcessingService } from './services/processing.service';
import { ProductService } from './services/product.service';
import { ProcessingController } from './controllers/processing.controller';
import { CompressImageConsumer } from './consumers/compress-image.consumer';
import { ProcessingRequest } from './entities/processing-request.entity';
import { Product } from './entities/product.entity';
import { CloudinaryProvider } from '../../common/providers/cloudinary.provider';
import { CsvHelper } from '../../common/helpers/csv.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProcessingRequest, Product]),
    BullModule.registerQueue({
      name: 'image-processing',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [ProcessingController],
  providers: [
    ProcessingService, 
    ProductService, 
    CompressImageConsumer,
    CloudinaryProvider,
    CsvHelper,
  ],
  exports: [ProcessingService],
})
export class ProcessingModule {} 