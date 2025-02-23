import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProcessingRequest } from './processing-request.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  serialNumber: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column('text', { array: true })
  inputImageUrls: string[];

  @Column('text', { array: true, nullable: true })
  outputImageUrls: string[];

  @ManyToOne(() => ProcessingRequest, { onDelete: 'CASCADE' })
  processingRequest: ProcessingRequest;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
