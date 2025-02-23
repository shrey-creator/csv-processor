# API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Upload CSV File
Upload a CSV file containing product and image information for processing.

```http
POST /csv/upload
Content-Type: multipart/form-data
```

#### Request Parameters
| Parameter  | Type   | Required | Description                                    |
|------------|--------|----------|------------------------------------------------|
| file       | File   | Yes      | CSV file containing product and image data     |
| webhookUrl | String | No       | URL to notify when processing is complete      |

#### CSV File Format
```csv
S. No.,Product Name,Input Image Urls
1,Product 1,https://example.com/image1.jpg,https://example.com/image2.jpg
2,Product 2,https://example.com/image3.jpg
```

#### Response
```json
{
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "CSV file uploaded successfully. Processing started."
}
```

#### Status Codes
| Status Code | Description                                          |
|-------------|------------------------------------------------------|
| 201         | File uploaded successfully                            |
| 400         | Invalid request (malformed CSV, missing file)         |
| 415         | Unsupported file type                                |
| 500         | Server error                                         |

### 2. Check Processing Status
Get the current status of a processing request.

```http
GET /csv/status/{requestId}
```

#### Path Parameters
| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| requestId | String | UUID of the processing request |

#### Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "originalFileName": "products.csv",
  "products": [
    {
      "id": "789e4567-e89b-12d3-a456-426614174000",
      "serialNumber": "1",
      "productName": "Product 1",
      "inputImageUrls": [
        "https://example.com/image1.jpg"
      ],
      "outputImageUrls": [
        "http://localhost:3000/uploads/processed-image1.jpg"
      ]
    }
  ],
  "createdAt": "2024-02-23T10:00:00Z",
  "updatedAt": "2024-02-23T10:05:00Z"
}
```

#### Status Field Values
| Value      | Description                                    |
|------------|------------------------------------------------|
| pending    | Request received, waiting to start processing   |
| processing | Currently processing images                     |
| completed  | All images processed successfully              |
| failed     | Processing failed, check errorMessage          |

#### Status Codes
| Status Code | Description                     |
|-------------|---------------------------------|
| 200         | Success                         |
| 404         | Request ID not found            |
| 500         | Server error                    |

### 3. Webhook Notifications
If a webhook URL is provided during upload, the system will send a POST request to that URL when processing is complete.

#### Webhook Payload
```json
{
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "products": [
    {
      "serialNumber": "1",
      "productName": "Product 1",
      "inputImageUrls": ["https://example.com/image1.jpg"],
      "outputImageUrls": ["http://localhost:3000/uploads/processed-image1.jpg"]
    }
  ]
}
```

## Error Responses
All error responses follow this format:
```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "error": "Error type"
}
```

## Rate Limiting
- Maximum file size: 10MB
- Maximum images per request: 100
- Rate limit: 10 requests per minute

## Authentication
Currently, the API does not require authentication. For production use, implement appropriate authentication mechanisms. 