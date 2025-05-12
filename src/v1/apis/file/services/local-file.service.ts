import FileService from './file.service.js';
import path from 'path';
import fs from 'fs';

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
    const fullPath = path.join(this.baseDir, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, fileBuffer);
    return this.getUrl(key);
  }

  getUrl(key: string): string {
    return new URL(key, this.baseUrl).toString();
  }
}
