import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ProcessingService } from './services/processing.service';
import { ProductService } from './services/product.service';
import { ProcessingController } from './controllers/processing.controller';
import { ProcessingProcessor } from './processors/processing.processor';
import { ProcessingRequest } from './entities/processing-request.entity';
import { Product } from './entities/product.entity';
import { ApideckModule } from '../../common/providers/apideck.module';

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
    ApideckModule,
  ],
  controllers: [ProcessingController],
  providers: [ProcessingService, ProductService, ProcessingProcessor],
  exports: [ProcessingService],
})
export class ProcessingModule {} 