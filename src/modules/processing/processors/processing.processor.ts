import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessingRequest, ProcessingStatus } from '../entities/processing-request.entity';
import * as sharp from 'sharp';
import axios from 'axios';
import * as path from 'path';
import { ApideckProvider } from '../../../common/providers/apideck.provider';
import { ProductService } from '../services/product.service';

@Processor('image-processing')
export class ProcessingProcessor {
  private readonly logger = new Logger(ProcessingProcessor.name);

  constructor(
    @InjectRepository(ProcessingRequest)
    private processingRequestRepository: Repository<ProcessingRequest>,
    private productService: ProductService,
    private apideckProvider: ApideckProvider,
  ) {}

  @Process('process-images')
  async processImages(job: Job<{ processingRequestId: string }>) {
    this.logger.debug(`Processing job ${job.id} for request ${job.data.processingRequestId}`);
    
    const processingRequest = await this.processingRequestRepository.findOne({
      where: { id: job.data.processingRequestId },
      relations: ['products'],
    });

    if (!processingRequest) {
      throw new Error('Processing request not found');
    }

    try {
      const products = await this.productService.findByProcessingRequestId(processingRequest.id);
      
      for (const product of products) {
        const outputUrls = await Promise.all(
          product.inputImageUrls.map((url) => this.processImage(url)),
        );

        await this.productService.updateProductOutputUrls(product.id, outputUrls);

        // Update job progress
        await job.progress((products.indexOf(product) + 1) / products.length * 100);
      }

      processingRequest.status = ProcessingStatus.COMPLETED;
      await this.processingRequestRepository.save(processingRequest);

      if (processingRequest.webhookUrl) {
        await this.notifyWebhook(processingRequest);
      }

      return { success: true, requestId: processingRequest.id };
    } catch (error) {
      this.logger.error(`Error processing images: ${error.message}`);
      processingRequest.status = ProcessingStatus.FAILED;
      processingRequest.errorMessage = error.message;
      await this.processingRequestRepository.save(processingRequest);
      throw error;
    }
  }

  private async processImage(imageUrl: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      const buffer = Buffer.from(response.data);

      const processedBuffer = await sharp(buffer)
        .jpeg({ quality: 50 })
        .toBuffer();

      const fileName = `processed-${path.basename(imageUrl)}`;
      
      const fileUrl = await this.apideckProvider.uploadFile(processedBuffer, fileName);
      return fileUrl;
    } catch (error) {
      this.logger.error(`Error processing image ${imageUrl}: ${error.message}`);
      throw error;
    }
  }

  private async notifyWebhook(processingRequest: ProcessingRequest): Promise<void> {
    try {
      await axios.post(processingRequest.webhookUrl, {
        requestId: processingRequest.id,
        status: processingRequest.status,
        products: processingRequest.products,
      });
    } catch (error) {
      this.logger.error(`Error notifying webhook: ${error.message}`);
    }
  }
} 