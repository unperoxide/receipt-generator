# bKash Receipt Generation API

A high-performance API service for generating dynamic receipt images for bKash transactions. Renders HTML templates using Nunjucks, converts them to PNG images using Puppeteer, and returns base64-encoded images.

## Features

- ✅ Dynamic receipt generation from JSON data
- ✅ Template inheritance with Nunjucks
- ✅ Base64 PNG image output
- ✅ Batch processing (up to 10 receipts)
- ✅ Health check endpoint
- ✅ Production-ready with Docker
- ✅ Deployable to Render.com (free tier)

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **Nunjucks** - Template engine
- **Puppeteer** - HTML to image conversion
- **Zod** - Schema validation
- **Docker** - Containerization

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Generate template previews
npm run preview

# Watch templates and regenerate previews
npm run preview:watch
```

Server runs on `http://localhost:3000`

## API Endpoints

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T01:40:02.562Z",
  "uptime": 17.51
}
```

### Generate Single Receipt

```http
POST /api/receipt
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "send-money",
  "data": {
    "recipientNumber": "01712345678",
    "recipientName": "John Doe",
    "avatar": "J",
    "time": "09:45pm 28/01/26",
    "transactionId": "TEST123456",
    "amount": "1,000.00",
    "fee": "10.00",
    "total": "1,010.00",
    "newBalance": "5,250.00",
    "reference": "Monthly payment"
  }
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KG...",
  "meta": {
    "type": "send-money",
    "generatedAt": "2026-01-28T01:40:00.000Z",
    "size": 245678
  }
}
```

### Generate Batch Receipts

```http
POST /api/receipts/batch
Content-Type: application/json
```

**Request Body:**
```json
{
  "receipts": [
    {
      "type": "send-money",
      "data": { /* receipt data */ }
    },
    {
      "type": "send-money",
      "data": { /* receipt data */ }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "receipts": [
    {
      "type": "send-money",
      "image": "data:image/png;base64,...",
      "size": 245678
    }
  ],
  "meta": {
    "total": 2,
    "generatedAt": "2026-01-28T01:40:00.000Z"
  }
}
```

**Limits:**
- Maximum 10 receipts per batch
- Synchronous processing
- ~1.5s per receipt

## Template Development

### Preview HTML Templates

```bash
npm run preview
```

Opens generated HTML files in `templates/preview/` - view them in your browser to test styling.

### Template Structure

```
templates/
├── layouts/
│   └── bkash-base.njk         # Base layout with common HTML
├── partials/
│   ├── status-bar.njk         # Mobile status bar
│   └── footer-button.njk      # Sticky footer button
├── receipts/
│   └── send-money.njk         # Receipt template (extends base)
└── sample-data.json           # Sample data for previews
```

### Adding New Receipt Types

1. Create new template in `templates/receipts/your-type.njk`
2. Extend base layout: `{% extends "layouts/bkash-base.njk" %}`
3. Add sample data to `templates/sample-data.json`
4. Run `npm run preview` to test
5. Use `type: "your-type"` in API requests

## Deployment

### Docker

```bash
# Build image
docker build -t bkash-receipt-api .

# Run container
docker run -p 3000:3000 bkash-receipt-api
```

### Render.com

1. Push code to GitHub
2. Connect repository to Render.com
3. Select "Web Service" with Docker environment
4. Render will use `render.yaml` configuration
5. Deploy automatically

**Free Tier Notes:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- 512MB RAM, 750 hours/month free

## Environment Variables

Create `.env` file:

```env
PORT=3000
NODE_ENV=development
```

## Project Structure

```
bkash-transaction-receipt/
├── src/
│   ├── config/
│   │   └── puppeteer.js           # Puppeteer configuration
│   ├── services/
│   │   ├── browserManager.js      # Browser lifecycle management
│   │   ├── templateRenderer.js    # Nunjucks rendering
│   │   └── screenshotService.js   # HTML to image conversion
│   ├── routes/
│   │   └── receipts.js            # API endpoints
│   ├── schemas/
│   │   └── receiptSchemas.js      # Zod validation
│   ├── utils/
│   │   ├── logger.js              # Logging utility
│   │   └── errorHandler.js        # Error middleware
│   └── server.js                  # Express app entry point
├── templates/                     # Nunjucks templates
├── icons/                         # Static SVG/PNG assets
├── examples/                      # API request examples
├── scripts/
│   └── preview-templates.js       # Template preview generator
├── Dockerfile                     # Docker configuration
├── render.yaml                    # Render.com config
└── package.json
```

## Performance

- **Single Receipt:** ~0.5-1.5 seconds
- **Batch (10):** ~5-15 seconds
- **Cold Start:** +2-4 seconds (first request)

## Error Handling

API returns standardized error responses:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "data.transactionId",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

## License

MIT
