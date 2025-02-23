import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessingRequest, ProcessingStatus } from '../entities/processing-request.entity';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { ApideckProvider } from '../../../common/providers/apideck.provider';
import { ProductService } from './product.service';

interface CsvProduct {
  serialNumber: string;
  productName: string;
  inputImageUrls: string[];
}

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    @InjectRepository(ProcessingRequest)
    private processingRequestRepository: Repository<ProcessingRequest>,
    @InjectQueue('image-processing') private imageProcessingQueue: Queue,
    private productService: ProductService,
  ) {}

  async processCSV(
    file: Express.Multer.File,
    webhookUrl?: string,
  ): Promise<ProcessingRequest> {
    const processingRequest = this.processingRequestRepository.create({
      originalFileName: file.originalname,
      webhookUrl,
      status: ProcessingStatus.PENDING,
    });

    await this.processingRequestRepository.save(processingRequest);

    try {
      const products = await this.parseCSV(file.path);
      await this.productService.createProducts(products, processingRequest);

      processingRequest.status = ProcessingStatus.PROCESSING;
      await this.processingRequestRepository.save(processingRequest);

      // Add job to queue
      await this.imageProcessingQueue.add(
        'process-images',
        {
          processingRequestId: processingRequest.id,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );

      return processingRequest;
    } catch (error) {
      processingRequest.status = ProcessingStatus.FAILED;
      processingRequest.errorMessage = error.message;
      await this.processingRequestRepository.save(processingRequest);
      throw error;
    }
  }

  private async parseCSV(filePath: string): Promise<CsvProduct[]> {
    return new Promise((resolve, reject) => {
      const products: CsvProduct[] = [];
      createReadStream(filePath)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
          }),
        )
        .on('data', (row) => {
          products.push({
            serialNumber: row['S. No.'] || row['Serial Number'],
            productName: row['Product Name'],
            inputImageUrls: (row['Input Image Urls'] || '')
              .split(',')
              .map((url) => url.trim())
              .filter((url) => url),
          });
        })
        .on('error', reject)
        .on('end', () => resolve(products));
    });
  }

  async getProcessingStatus(requestId: string): Promise<ProcessingRequest> {
    const request = await this.processingRequestRepository.findOne({
      where: { id: requestId },
      relations: ['products'],
    });

    if (!request) {
      throw new BadRequestException('Processing request not found');
    }

    return request;
  }

  async getJobStatus(jobId: string) {
    const job = await this.imageProcessingQueue.getJob(jobId);
    if (!job) {
      throw new BadRequestException('Job not found');
    }

    const state = await job.getState();
    const progress = await job.progress();

    return {
      id: job.id,
      state,
      progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      timestamp: job.timestamp,
    };
  }
} 