import { z } from 'zod';
import { createResponseSchema } from '../../../common/schema/core.schema.js';

export const getUrlQuerySchema = z.object({
  key: z.string(),
});

export const getUrlResponseSchema = createResponseSchema(
  z.object({
    url: z.string().url(),
  }),
);
