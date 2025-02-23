import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse';
import {
  ProcessingRequest,
  ProcessingStatus,
} from '../../common/entities/processing-request.entity';
import { Product } from '../../common/entities/product.entity';
import { createReadStream } from 'fs';

interface CsvProduct {
  serialNumber: string;
  productName: string;
  inputImageUrls: string[];
}

@Injectable()
export class CsvService {
  constructor(
    @InjectRepository(ProcessingRequest)
    private processingRequestRepository: Repository<ProcessingRequest>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
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
      await this.validateAndSaveProducts(products, processingRequest);

      processingRequest.status = ProcessingStatus.PROCESSING;
      await this.processingRequestRepository.save(processingRequest);

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

  private async validateAndSaveProducts(
    products: CsvProduct[],
    processingRequest: ProcessingRequest,
  ) {
    if (!products.length) {
      throw new BadRequestException('CSV file is empty');
    }

    for (const product of products) {
      if (
        !product.serialNumber ||
        !product.productName ||
        !product.inputImageUrls.length
      ) {
        throw new BadRequestException(
          'Invalid CSV format. Required columns: Serial Number, Product Name, Input Image Urls',
        );
      }

      const newProduct = this.productRepository.create({
        ...product,
        processingRequest,
      });
      await this.productRepository.save(newProduct);
    }
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
}
