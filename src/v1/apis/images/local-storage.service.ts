import fs from 'fs';
import path from 'path';
import { InternalServerException } from '../../common/exceptions/core.error.js';
import { MultipartFile } from '@fastify/multipart';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { pipeline } from 'stream';

export default class LocalStorageService {
  constructor(private readonly avatarUploadDir: string) {
    if (!avatarUploadDir) {
      throw new InternalServerException('AVATAR_UPLOADS_DIR 환경변수가 설정되어 있지 않습니다.');
    }
  }

  async saveFile(data: MultipartFile, userId: number): Promise<string> {
    this.ensureUploadDir(this.avatarUploadDir);

    const ext = data.filename.split('.').pop();
    const filename = `${userId}-${uuidv4()}.${ext}`;
    const filepath = path.join(this.avatarUploadDir, filename);
    const pump = promisify(pipeline);

    try {
      await pump(data.file, fs.createWriteStream(filepath));
    } catch {
      throw new InternalServerException('파일 저장에 실패했습니다.');
    }

    return filename;
  }

  private ensureUploadDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
      } catch (err) {
        throw new InternalServerException('폴더 생성에 실패했습니다.');
      }
    }
  }
}
