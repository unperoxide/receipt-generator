import { z } from 'zod';

export const receiptDataSchema = z.object({
    recipientNumber: z.string().min(1),
    recipientName: z.string().min(1),
    avatar: z.string().optional().default('0'),
    time: z.string().min(1),
    transactionId: z.string().min(1),
    amount: z.string().min(1),
    fee: z.string().min(1),
    total: z.string().min(1),
    newBalance: z.string().min(1),
    reference: z.string().optional().default(''),
    batteryPercentage: z.string().optional().default('50'),
    buttonText: z.string().optional().default('Back to Home'),
});

export const singleReceiptSchema = z.object({
    type: z.enum(['send-money', 'cash-out']),
    data: receiptDataSchema,
});

export const batchReceiptSchema = z.object({
    receipts: z.array(singleReceiptSchema).min(1).max(10),
});

export function validateSingleReceipt(payload) {
    return singleReceiptSchema.parse(payload);
}

export function validateBatchReceipt(payload) {
    return batchReceiptSchema.parse(payload);
}
