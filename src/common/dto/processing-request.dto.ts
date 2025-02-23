import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional } from 'class-validator';

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
  @IsUrl()
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
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
  })
  status: string;

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
    required: false,
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