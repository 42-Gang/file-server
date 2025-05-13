import { TypeOf } from 'zod';
import { uploadResponseSchema } from '../schemas/upload.schema.js';

export default interface FileService {
  upload(fileBuffer: Buffer, key: string): Promise<TypeOf<typeof uploadResponseSchema>>;

  getUrl(key: string): string;
}
