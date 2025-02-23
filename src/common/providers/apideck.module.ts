import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApideckProvider } from './apideck.provider';

@Module({
  imports: [ConfigModule],
  providers: [ApideckProvider],
  exports: [ApideckProvider],
})
export class ApideckModule {} 