import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import receiptRoutes from './routes/receipts.js';
import browserManager from './services/browserManager.js';
import { errorHandler } from './utils/errorHandler.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.use('/icons', express.static(join(__dirname, '../icons')));

app.get('/', (req, res) => {
  res.json({
    service: 'Receipt Generator API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      generateReceipt: 'POST /api/receipt',
      generateBatch: 'POST /api/receipts/batch',
      demo: '/dev (development only)'
    },
    documentation: 'https://github.com/YOUR_USERNAME/receipt-generator'
  });
});

app.get('/dev', async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Demo route is only available in development environment'
    });
  }

  try {
    const { default: templateRenderer } = await import('./services/templateRenderer.js');
    const { default: screenshotService } = await import('./services/screenshotService.js');

    logger.info('Generating demo receipt');

    const exampleData = {
      recipientNumber: '01712345678',
      recipientName: 'John Doe',
      avatar: 'J',
      time: '09:45pm 28/01/26',
      transactionId: 'DEMO123456',
      amount: '1,000.00',
      fee: '10.00',
      total: '1,010.00',
      newBalance: '5,250.00',
      reference: 'Test Payment',
    };

    const html = await templateRenderer.renderAsync('send-money', exampleData);
    const image = await screenshotService.generateBase64Screenshot(html);

    logger.info('Image generated', {
      imageType: typeof image,
      imageLength: image?.length,
      first50: image?.substring(0, 50)
    });

    res.send(`<img width="400px" style="margin: auto;" src="${String(image)}" alt="Receipt">`);
  } catch (error) {
    next(error);
  }
});

app.use('/api', receiptRoutes);

app.use(errorHandler);

let server;

async function startServer() {
  try {
    await browserManager.initialize();

    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
      });
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

    setupGracefulShutdown();
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed');

        await browserManager.close();

        logger.info('Shutdown complete');
        process.exit(0);
      });
    }

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    shutdown('unhandledRejection');
  });
}

startServer();
