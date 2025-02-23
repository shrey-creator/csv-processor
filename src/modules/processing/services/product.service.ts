import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProcessingRequest } from '../entities/processing-request.entity';

interface CreateProductDto {
  serialNumber: string;
  productName: string;
  inputImageUrls: string[];
  processingRequest: ProcessingRequest;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async createProducts(
    products: Omit<CreateProductDto, 'processingRequest'>[],
    processingRequest: ProcessingRequest,
  ): Promise<Product[]> {
    if (!products.length) {
      throw new BadRequestException('No products to create');
    }

    // Validate products
    for (const product of products) {
      if (
        !product.serialNumber ||
        !product.productName ||
        !product.inputImageUrls.length
      ) {
        throw new BadRequestException(
          'Invalid product data. Required fields: Serial Number, Product Name, Input Image Urls',
        );
      }
    }

    // Create and save all products
    const createdProducts = await Promise.all(
      products.map((product) =>
        this.createProduct({
          ...product,
          processingRequest,
        }),
      ),
    );

    return createdProducts;
  }

  async updateProductOutputUrls(
    productId: string,
    outputImageUrls: string[],
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    product.outputImageUrls = outputImageUrls;
    return this.productRepository.save(product);
  }

  async findByProcessingRequestId(processingRequestId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { processingRequest: { id: processingRequestId } },
    });
  }
} 