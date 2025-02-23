import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessingRequest, ProcessingStatus } from '../entities/processing-request.entity';
import { ProductService } from './product.service';
import { CsvHelper } from '../../../common/helpers/csv.helper';
import { ProcessingStatusDto, ProcessingDetailsDto, ProductDetailsDto } from '../dto/processing.dto';

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    @InjectRepository(ProcessingRequest)
    private processingRequestRepository: Repository<ProcessingRequest>,
    @InjectQueue('image-processing') private imageProcessingQueue: Queue,
    private productService: ProductService,
    private csvHelper: CsvHelper,
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
      // Validate and parse CSV
      
      const  products = await this.csvHelper.parseCSVBuffer(file);
     

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

  async getProcessingStatus(requestId: string): Promise<ProcessingStatusDto> {
    const request = await this.processingRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new BadRequestException('Processing request not found');
    }

    return {
      id: request.id,
      status: request.status,
    };
  }

  async getProcessingDetails(requestId: string): Promise<ProcessingDetailsDto> {
    const request = await this.processingRequestRepository.findOne({
      where: { id: requestId },
      relations: ['products'],
    });

    if (!request) {
      throw new BadRequestException('Processing request not found');
    }

    const products: ProductDetailsDto[] = request.products.map(product => ({
      id: product.id,
      serialNumber: product.serialNumber,
      productName: product.productName,
      inputImageUrls: product.inputImageUrls,
      outputImageUrls: product.outputImageUrls,
    }));

    return {
      id: request.id,
      originalFileName: request.originalFileName,
      status: request.status,
      errorMessage: request.errorMessage,
      webhookUrl: request.webhookUrl,
      products,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
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