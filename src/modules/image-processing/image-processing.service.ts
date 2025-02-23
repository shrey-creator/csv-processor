import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProcessingRequest,
  ProcessingStatus,
} from '../../common/entities/processing-request.entity';
import { Product } from '../../common/entities/product.entity';
import * as sharp from 'sharp';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  constructor(
    @InjectRepository(ProcessingRequest)
    private processingRequestRepository: Repository<ProcessingRequest>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async processImages(processingRequestId: string): Promise<void> {
    const processingRequest = await this.processingRequestRepository.findOne({
      where: { id: processingRequestId },
      relations: ['products'],
    });

    if (!processingRequest) {
      throw new Error('Processing request not found');
    }

    try {
      for (const product of processingRequest.products) {
        const outputUrls = await Promise.all(
          product.inputImageUrls.map((url) => this.processImage(url)),
        );

        product.outputImageUrls = outputUrls;
        await this.productRepository.save(product);
      }

      processingRequest.status = ProcessingStatus.COMPLETED;
      await this.processingRequestRepository.save(processingRequest);

      if (processingRequest.webhookUrl) {
        await this.notifyWebhook(processingRequest);
      }
    } catch (error) {
      this.logger.error(`Error processing images: ${error.message}`);
      processingRequest.status = ProcessingStatus.FAILED;
      processingRequest.errorMessage = error.message;
      await this.processingRequestRepository.save(processingRequest);
    }
  }

  private async processImage(imageUrl: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      const buffer = Buffer.from(response.data);

      const processedBuffer = await sharp(buffer)
        .jpeg({ quality: 50 }) // Compress by 50%
        .toBuffer();

      // In a real application, you would upload this to a cloud storage service
      // For this example, we'll save locally and return a mock URL
      const fileName = `processed-${path.basename(imageUrl)}`;
      const outputPath = path.join(process.cwd(), 'uploads', fileName);

      await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true });
      await fs.writeFile(outputPath, processedBuffer);

      // In real application, return the cloud storage URL
      return `http://localhost:3000/uploads/${fileName}`;
    } catch (error) {
      this.logger.error(`Error processing image ${imageUrl}: ${error.message}`);
      throw error;
    }
  }

  private async notifyWebhook(
    processingRequest: ProcessingRequest,
  ): Promise<void> {
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
