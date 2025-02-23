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
  ProcessingStatusDto,
  ProcessingDetailsDto,
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

  @Get('/:processingId')
  @ApiOperation({
    summary: 'Get detailed processing information',
    description: 'Get complete information about a processing request including all products and their status',
  })
  @ApiParam({
    name: 'processingId',
    description: 'The ID of the processing request',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed information about the processing request',
    type: ProcessingDetailsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Processing request not found',
  })
  async getDetails(@Param('processingId') processingId: string) {
    return this.processingService.getProcessingDetails(processingId);
  }

  @Get('/:processingId/status')
  @ApiOperation({
    summary: 'Get processing status',
    description: 'Get only the status of a processing request (lightweight endpoint)',
  })
  @ApiParam({
    name: 'processingId',
    description: 'The ID of the processing request',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Current status of the processing request',
    type: ProcessingStatusDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Processing request not found',
  })
  async getStatus(@Param('processingId') processingId: string) {
    return this.processingService.getProcessingStatus(processingId);
  }
} 