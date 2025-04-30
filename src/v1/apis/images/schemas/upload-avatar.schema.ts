import { createResponseSchema } from '../../../common/schema/core.schema.js';
import { z } from 'zod';

export const uploadAvatarResponseSchema = createResponseSchema(z.any());
