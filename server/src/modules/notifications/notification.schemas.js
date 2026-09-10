import { z } from 'zod';

const resourceId = z.string().trim().min(1).max(128);

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
}).strict();

export const notificationParamsSchema = z.object({
  notificationId: resourceId,
}).strict();
