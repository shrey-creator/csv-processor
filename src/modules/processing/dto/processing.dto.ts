import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional } from 'class-validator';
import { ProcessingStatus } from '../entities/processing-request.entity';

export class ProcessingRequestDto {
  @ApiProperty({
    description: 'The CSV file to process',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;

  @ApiProperty({
    description: 'Optional webhook URL to notify when processing is complete',
    required: false,
  })
  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

export class ProcessingResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the processing request',
  })
  id: string;

  @ApiProperty({
    description: 'The original filename of the uploaded CSV',
  })
  originalFileName: string;

  @ApiProperty({
    description: 'The current status of the processing request',
    enum: ProcessingStatus,
  })
  status: ProcessingStatus;

  @ApiProperty({
    description: 'Error message if processing failed',
    required: false,
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Webhook URL for notifications',
    required: false,
  })
  webhookUrl?: string;
}

export class JobStatusResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the job',
  })
  id: string;

  @ApiProperty({
    description: 'The current state of the job',
    enum: ['waiting', 'active', 'completed', 'failed', 'delayed'],
  })
  state: string;

  @ApiProperty({
    description: 'The progress of the job (0-100)',
  })
  progress: number;

  @ApiProperty({
    description: 'The job data',
    type: 'object',
    additionalProperties: true,
  })
  data: Record<string, any>;

  @ApiProperty({
    description: 'The return value of the job if completed',
    type: 'object',
    additionalProperties: true,
  })
  returnvalue?: Record<string, any>;

  @ApiProperty({
    description: 'The reason for failure if the job failed',
  })
  failedReason?: string;

  @ApiProperty({
    description: 'The stack trace if the job failed',
    type: 'array',
    items: {
      type: 'string',
    },
    required: false,
  })
  stacktrace?: string[];
}

export class ProcessingStatusDto {
  @ApiProperty({
    description: 'The unique identifier of the processing request',
  })
  id: string;

  @ApiProperty({
    description: 'The current status of the processing request',
    enum: ProcessingStatus,
  })
  status: ProcessingStatus;

}

export class ProductDetailsDto {
  @ApiProperty({
    description: 'The unique identifier of the product',
  })
  id: string;

  @ApiProperty({
    description: 'The serial number of the product',
  })
  serialNumber: string;

  @ApiProperty({
    description: 'The name of the product',
  })
  productName: string;

  @ApiProperty({
    description: 'Array of input image URLs',
    type: [String],
  })
  inputImageUrls: string[];

  @ApiProperty({
    description: 'Array of processed image URLs',
    type: [String],
    required: false,
  })
  outputImageUrls?: string[];
}

export class ProcessingDetailsDto {
  @ApiProperty({
    description: 'The unique identifier of the processing request',
  })
  id: string;

  @ApiProperty({
    description: 'The original filename of the uploaded CSV',
  })
  originalFileName: string;

  @ApiProperty({
    description: 'The current status of the processing request',
    enum: ProcessingStatus,
  })
  status: ProcessingStatus;

  @ApiProperty({
    description: 'Error message if processing failed',
    required: false,
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Webhook URL for notifications',
    required: false,
  })
  webhookUrl?: string;

  @ApiProperty({
    description: 'Array of products being processed',
    type: [ProductDetailsDto],
  })
  products: ProductDetailsDto[];

  @ApiProperty({
    description: 'When the processing request was created',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the processing request was last updated',
  })
  updatedAt: Date;
} 