import express from 'express';
import { validateSingleReceipt, validateBatchReceipt } from '../schemas/receiptSchemas.js';
import templateRenderer from '../services/templateRenderer.js';
import screenshotService from '../services/screenshotService.js';
import { asyncHandler } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/receipt', asyncHandler(async (req, res) => {
  const { type, data } = validateSingleReceipt(req.body);

  logger.info('Generating receipt', { type });

  const html = await templateRenderer.renderAsync(type, data);
  const image = await screenshotService.generateBase64Screenshot(html);

  res.json({
    success: true,
    image,
    meta: {
      type,
      generatedAt: new Date().toISOString(),
      size: Buffer.from(image.split(',')[1], 'base64').length,
    },
  });
}));

router.post('/receipts/batch', asyncHandler(async (req, res) => {
  const { receipts } = validateBatchReceipt(req.body);

  logger.info('Generating batch receipts', { count: receipts.length });

  const results = [];

  for (const receipt of receipts) {
    const { type, data } = receipt;
    const html = await templateRenderer.renderAsync(type, data);
    const image = await screenshotService.generateBase64Screenshot(html);

    results.push({
      type,
      image,
      size: Buffer.from(image.split(',')[1], 'base64').length,
    });
  }

  res.json({
    success: true,
    receipts: results,
    meta: {
      total: results.length,
      generatedAt: new Date().toISOString(),
    },
  });
}));

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
