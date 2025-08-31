import FileService from './file.service.js';
import path from 'path';
import fs from 'fs';
import { TypeOf } from 'zod';
import { uploadResponseSchema } from '../schemas/upload.schema.js';
import { STATUS } from '../../../common/constants/status.js';
import { BadRequestException, ConflictException } from '../../../common/exceptions/core.error.js';

const MAX_FILENAME_LEN = 255;

export default class LocalFileService implements FileService {
  constructor(
    private readonly baseDir: string,
    private readonly baseUrl: string,
  ) {
    if (!baseDir) {
      throw new Error('baseDir is required and must be a non-empty string');
    }
    if (!baseUrl) {
      throw new Error('baseUrl is required and must be a non-empty string');
    }
  }

  async upload(fileBuffer: Buffer, key: string): Promise<TypeOf<typeof uploadResponseSchema>> {
    if (!this.isValidFilename(key)) {
      throw new BadRequestException('유효하지 않은 파일 이름입니다.');
    }

    const fullPath = path.join(this.baseDir, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    try {
      fs.writeFileSync(fullPath, fileBuffer, { flag: 'wx' }); // 파일이 있으면 throw
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new ConflictException('파일이 이미 존재합니다.');
      }
      throw err;
    }

    return {
      status: STATUS.SUCCESS,
      data: {
        url: this.getUrl(key),
      },
    };
  }

  getUrl(key: string): string {
    const normalizedBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    return new URL(key, normalizedBaseUrl).toString();
  }

  private isValidFilename(filename: string): boolean {
    const invalidPattern = /[\/\\:*?"<>|]/;

    if (MAX_FILENAME_LEN < filename.length) {
      return false;
    }
    if (invalidPattern.test(filename)) {
      return false;
    }
    if (filename !== path.basename(filename)) {
      return false;
    }

    return true;
  }
}
