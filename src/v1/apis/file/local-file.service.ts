import FileService from './file.service.js';
import path from 'path';
import fs from 'fs';
import { NotFoundException } from '../../common/exceptions/core.error.js';

export default class LocalFileService implements FileService {
  constructor(
    private readonly baseDir: string,
    private readonly baseUrl: string,
  ) {}

  async upload(fileBuffer: Buffer, key: string): Promise<string> {
    const fullPath = path.join(this.baseDir, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, fileBuffer);
    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.baseDir, key);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File not found');
    }
    fs.unlinkSync(fullPath);
  }

  getUrl(key: string): string {
    return path.join(this.baseUrl, key);
  }
}
