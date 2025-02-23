import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProcessingService } from '../services/processing.service';
import {
  ProcessingRequestDto,
  ProcessingResponseDto,
  JobStatusResponseDto,
} from '../dto/processing.dto';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiProduces,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('processing')
@Controller('processing')
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a CSV file for image processing',
    description: 'Upload a CSV file containing product data and image URLs for processing',
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 201,
    description: 'The CSV file has been successfully uploaded and processing has started',
    type: ProcessingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or content',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'text/csv' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() processingRequestDto: ProcessingRequestDto,
  ) {
    return this.processingService.processCSV(file, processingRequestDto.webhookUrl);
  }

  @Get('status/:requestId')
  @ApiOperation({
    summary: 'Get processing status',
    description: 'Get the current status of a processing request',
  })
  @ApiParam({
    name: 'requestId',
    description: 'The ID of the processing request',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'The current status of the processing request',
    type: ProcessingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Processing request not found',
  })
  async getStatus(@Param('requestId') requestId: string) {
    return this.processingService.getProcessingStatus(requestId);
  }

  @Get('job/:jobId')
  @ApiOperation({
    summary: 'Get job status',
    description: 'Get the current status of an image processing job',
  })
  @ApiParam({
    name: 'jobId',
    description: 'The ID of the job',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'The current status of the job',
    type: JobStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.processingService.getJobStatus(jobId);
  }
} 