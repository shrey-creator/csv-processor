# Asynchronous Workers Documentation

## Overview
The system uses asynchronous processing to handle image downloads and processing without blocking the main request-response cycle. This document describes the worker functions and their responsibilities.

## Worker Components

### 1. Image Processing Worker
Located in `ImageProcessingService`, this worker handles the asynchronous processing of images.

#### Main Function: `processImages()`
```typescript
async processImages(processingRequestId: string): Promise<void>
```

- **Purpose**: Orchestrates the entire image processing workflow
- **Triggered by**: CSV upload completion
- **Operations**:
  1. Loads processing request and associated products
  2. Downloads images from input URLs
  3. Processes images using Sharp
  4. Saves processed images
  5. Updates product records with output URLs
  6. Updates processing status
  7. Triggers webhook notification if configured

#### Sub-Functions

##### `processImage()`
```typescript
private async processImage(imageUrl: string): Promise<string>
```
- Downloads image from URL
- Compresses image using Sharp (50% quality)
- Saves to local storage
- Returns processed image URL

##### `notifyWebhook()`
```typescript
private async notifyWebhook(processingRequest: ProcessingRequest): Promise<void>
```
- Sends webhook notification on completion
- Handles webhook failures gracefully

### 2. Error Handling
The workers implement comprehensive error handling:

1. **Individual Image Failures**
   - Continues processing other images if one fails
   - Records specific error messages
   - Maintains processing state

2. **Webhook Failures**
   - Logs failures but doesn't affect processing status
   - Implements retry mechanism (TODO)

3. **Database Transaction Handling**
   - Ensures atomic operations
   - Maintains data consistency

## State Management

### Processing States
1. **Pending**
   - Initial state after CSV upload
   - Request recorded, waiting for processing

2. **Processing**
   - Worker actively processing images
   - Can query status via API

3. **Completed**
   - All images processed successfully
   - Output URLs available
   - Webhook notification sent (if configured)

4. **Failed**
   - Processing encountered errors
   - Error message recorded
   - Can retry processing (TODO)

## Performance Considerations

### Concurrency
- Processes multiple images concurrently using `Promise.all()`
- Configurable batch size for large requests
- Memory usage monitoring

### Resource Management
1. **Temporary Storage**
   - Cleans up downloaded files after processing
   - Implements file size limits
   - Regular cleanup of old files

2. **Database Connections**
   - Connection pooling
   - Transaction management
   - Retry mechanisms

### Monitoring
- Logs processing times
- Tracks success/failure rates
- Records resource usage

## Future Improvements

1. **Retry Mechanism**
   - Implement automatic retries for failed images
   - Configurable retry attempts
   - Exponential backoff

2. **Queue System**
   - Add message queue (e.g., Redis, RabbitMQ)
   - Better handling of high load
   - Processing prioritization

3. **Cloud Storage**
   - Replace local storage with cloud storage
   - Better scalability
   - Improved reliability

4. **Monitoring Dashboard**
   - Real-time processing status
   - System health metrics
   - Error tracking

## Configuration Options
```typescript
const workerConfig = {
  maxConcurrentProcessing: 5,
  imageQuality: 50,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  webhookRetryAttempts: 3,
  webhookRetryDelay: 1000, // ms
};
```

## Deployment Considerations

### Scaling
- Horizontally scalable
- Stateless processing
- Shared storage requirements

### Monitoring
- Health checks
- Error rates
- Processing times
- Resource usage

### Logging
- Processing events
- Error details
- Performance metrics
- Webhook interactions 