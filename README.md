# Image Processing System

A NestJS-based system for processing product images from CSV files with asynchronous processing and status tracking.

## Features

- CSV file upload and validation
- Asynchronous image processing
- Webhook notifications for status updates
- RESTful API for status checking
- Cloud storage integration (Cloudinary)
- Queue-based processing with Bull
- PostgreSQL database for data persistence
- Swagger API documentation

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v14 or later)
- Redis (v6 or later)
- Cloudinary account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/image-processing-system.git
cd image-processing-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# App
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/image_processing

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Queue
MAX_CONCURRENT_JOBS=5
JOB_TIMEOUT=300000

# Security
API_KEY=your-api-key
```

4. Run database migrations:
```bash
npm run typeorm migration:run
```

## Running the Application

### Development
```bash
# Start in development mode
npm run start:dev

# Start with debugging enabled
npm run start:debug
```

### Production
```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

For detailed API documentation and examples, see the [Postman Collection](docs/postman-collection.md).

## Architecture

The system is built with a modular architecture:

- **API Layer**: Handles HTTP requests and input validation
- **Service Layer**: Contains business logic and orchestrates operations
- **Queue Layer**: Manages asynchronous processing with Bull
- **Storage Layer**: Handles cloud storage operations
- **Database Layer**: Manages data persistence with TypeORM
- **Worker Layer**: Processes images and sends notifications

For detailed technical documentation, see:
- [Technical Design](docs/technical-design.md)
- [Worker Documentation](docs/worker-documentation.md)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## CSV File Format

The input CSV file should follow this format:
```csv
sku,name,description,image_url
PROD-001,Product 1,Description 1,https://example.com/image1.jpg
PROD-002,Product 2,Description 2,https://example.com/image2.jpg
```

Required columns:
- sku (unique identifier)
- name (product name)
- description (product description)
- image_url (URL of the product image)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
