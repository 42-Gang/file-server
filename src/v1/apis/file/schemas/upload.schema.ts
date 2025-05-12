import { z } from 'zod';
import { createResponseSchema } from '../../../common/schema/core.schema.js';

export const uploadResponseSchema = createResponseSchema(
  z.object({
    url: z.string().url(),
  }),
);
