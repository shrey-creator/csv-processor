import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';
import { ProcessingRequest } from '../../common/entities/processing-request.entity';
import { Product } from '../../common/entities/product.entity';
import { ImageProcessingModule } from '../image-processing/image-processing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProcessingRequest, Product]),
    ImageProcessingModule,
  ],
  controllers: [CsvController],
  providers: [CsvService],
  exports: [CsvService],
})
export class CsvModule {}
