import { IsString, IsOptional } from 'class-validator';

export class UploadCsvDto {
  @IsString()
  @IsOptional()
  webhookUrl?: string;
}
