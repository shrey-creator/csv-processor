# CSV Image Processor

A NestJS application that processes CSV files containing product information and image URLs, compresses the images, and provides status updates through a REST API.

## Features

- CSV file upload and validation
- Asynchronous image processing
- Image compression (50% quality reduction)
- Webhook notifications for process completion
- Status tracking via API
- PostgreSQL database for data persistence

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd csv-processor
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following content:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=csv_processor
NODE_ENV=development
```

4. Create the PostgreSQL database:
```sql
CREATE DATABASE csv_processor;
```

5. Start the application:
```bash
npm run start:dev
```

## API Endpoints

### 1. Upload CSV File
```http
POST /csv/upload
Content-Type: multipart/form-data

file: <csv-file>
webhookUrl: <optional-webhook-url>
```

Response:
```json
{
  "requestId": "uuid",
  "message": "CSV file uploaded successfully. Processing started."
}
```

### 2. Check Processing Status
```http
GET /csv/status/:requestId
```

Response:
```json
{
  "id": "uuid",
  "status": "pending|processing|completed|failed",
  "originalFileName": "example.csv",
  "products": [
    {
      "serialNumber": "1",
      "productName": "Example Product",
      "inputImageUrls": ["https://example.com/input1.jpg"],
      "outputImageUrls": ["http://localhost:3000/uploads/processed-input1.jpg"]
    }
  ]
}
```

## CSV File Format

The CSV file should have the following columns:
- Serial Number (S. No.)
- Product Name
- Input Image Urls (comma-separated URLs)

Example:
```csv
S. No.,Product Name,Input Image Urls
1,Product 1,https://example.com/image1.jpg,https://example.com/image2.jpg
2,Product 2,https://example.com/image3.jpg
```

## Webhook Integration

If a webhook URL is provided during file upload, the system will send a POST request to that URL when processing is complete. The webhook payload will include:
- requestId
- status
- products (array of processed products with input and output URLs)

## Error Handling

The application includes comprehensive error handling for:
- Invalid CSV format
- Image download/processing failures
- Database operations
- Webhook notifications

## Development

To run the application in development mode with hot reload:
```bash
npm run start:dev
```

## Testing

To run tests:
```bash
npm run test
```

## License

MIT 