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
http://localhost:3000/api
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
- [Technical Design](https://docs.google.com/document/d/1m3XQo2PwDqj5qGrv48ivUIs4OyCBMoWrfNt8kcu9kNM/edit?usp=sharing)

