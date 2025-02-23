import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse';

export interface CsvProduct {
  serialNumber: string;
  productName: string;
  inputImageUrls: string[];
}

const REQUIRED_COLUMNS = ['S. No.', 'Product Name', 'Input Image Urls'];
const URL_REGEX = /^(http|https):\/\/[^ "]+$/;

@Injectable()
export class CsvHelper {
  private readonly logger = new Logger(CsvHelper.name);

  async parseCSVBuffer(file: Express.Multer.File): Promise<CsvProduct[]> {
    return new Promise((resolve, reject) => {
      const products: CsvProduct[] = [];
      let rowNumber = 1; // Header is row 1
      let headers: string[] = [];

      parse(file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        on_record: (record, context) => {
          rowNumber = context.records + 1; // +1 because records is 0-based
          return record;
        },
      })
        .on('data', (row) => {
          try {
            const validatedProduct = this.validateAndTransformRow(row, rowNumber);
            products.push(validatedProduct);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          this.logger.error(`Error parsing CSV: ${error.message}`);
          reject(new BadRequestException(`CSV parsing error: ${error.message}`));
        })
        .on('end', () => {
          if (products.length === 0) {
            reject(new BadRequestException('CSV file contains no valid product data'));
            return;
          }
          this.logger.debug(`Successfully parsed ${products.length} products from CSV`);
          resolve(products);
        });
    });
  }

  private validateHeaders(headers: string[]): void {
    const missingColumns = REQUIRED_COLUMNS.filter(column => !headers.includes(column));

    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `Missing required columns: ${missingColumns.join(', ')}`
      );
    }
  }

  private validateAndTransformRow(row: any, rowNumber: number): CsvProduct {
    // Validate Serial Number
    const serialNumber = row['S. No.'] || row['Serial Number'];
    if (!serialNumber) {
      throw new BadRequestException(
        'Serial Number is required',
      );
    }

    // Validate Product Name
    const productName = row['Product Name'];
    if (!productName || productName.trim().length === 0) {
      throw new BadRequestException(
        'Product Name is required and cannot be empty',
        productName
      );
    }

    // Validate and transform Image URLs
    const imageUrlsString = row['Input Image Urls'] || '';
    const imageUrls = imageUrlsString
      .split(',')
      .map((url: string) => url.trim())
      .filter((url: string) => url);

    if (imageUrls.length === 0) {
      throw new BadRequestException(
        'At least one valid Image URL is required',
        imageUrlsString
      );
    }

    // Validate URL format
    for (const url of imageUrls) {
      if (!URL_REGEX.test(url)) {
        throw new BadRequestException(
          'Invalid URL format',
          url
        );
      }
    }

    return {
      serialNumber,
      productName,
      inputImageUrls: imageUrls,
    };
  }
} 