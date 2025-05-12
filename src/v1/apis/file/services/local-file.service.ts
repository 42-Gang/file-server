import FileService from './file.service.js';
import path from 'path';
import fs from 'fs';
import { BadRequestException, ConflictException } from 'src/v1/common/exceptions/core.error.js';

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

  async upload(fileBuffer: Buffer, key: string): Promise<string> {
    if (!this.isValidFilename(key)) {
      throw new BadRequestException('유효하지 않은 파일 이름입니다.');
    }

    const fullPath = path.join(this.baseDir, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    if (fs.existsSync(fullPath)) {
      throw new ConflictException('파일이 이미 존재합니다.');
    }

    fs.writeFileSync(fullPath, fileBuffer);
    return this.getUrl(key);
  }

  getUrl(key: string): string {
    return new URL(key, this.baseUrl + '/uploads').toString();
  }

  private isValidFilename(filename: string): boolean {
    const invalidPattern = /[\/\\:*?"<>|]/;
    return !invalidPattern.test(filename) && filename.length <= 255;
  }
}
