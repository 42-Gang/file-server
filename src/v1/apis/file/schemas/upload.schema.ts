import { z } from 'zod';

export const uploadBodySchema = z.object({
  key: z.string(),
});
