import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageProcessingService } from './image-processing.service';
import { ProcessingRequest } from '../../common/entities/processing-request.entity';
import { Product } from '../../common/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessingRequest, Product])],
  providers: [ImageProcessingService],
  exports: [ImageProcessingService],
})
export class ImageProcessingModule {}
