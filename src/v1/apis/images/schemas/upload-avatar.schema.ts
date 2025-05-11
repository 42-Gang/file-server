import { createResponseSchema } from '../../../common/schema/core.schema.js';
import { BadRequestException } from '../../../common/exceptions/core.error.js';
import { z } from 'zod';
import { MultipartFile } from '@fastify/multipart';

export const uploadAvatarResponseSchema = createResponseSchema(z.any());

export function parseUploadAvatarRequest(file: MultipartFile | undefined) {
  if (!file) {
    throw new BadRequestException('파일이 업로드되지 않았습니다.');
  }

  return file;
}
