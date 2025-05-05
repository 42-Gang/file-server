import { TypeOf } from 'zod';
import {
  NotFoundException,
  BadRequestException,
  InternalServerException,
} from '../../common/exceptions/core.error.js';
import { STATUS } from '../../common/constants/status.js';
import { uploadAvatarResponseSchema } from './schemas/upload-avatar.schema.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import path from 'path';
import { MultipartFile } from '@fastify/multipart';
import { sendAvatarUploadEvent } from '../../kafka/producers/image.producer.js';

export default class ImagesService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    const uploadPath = process.env.UPLOADS_PATH;
    if (!uploadPath) {
      throw new InternalServerException('UPLOADS_PATH 환경변수가 설정되어 있지 않습니다.');
    }
    this.uploadDir = uploadPath;
    this.baseUrl = process.env.GATEWAY_URL || 'http://localhost:3000';
  }

  async uploadAvatar(
    userId: number,
    data: MultipartFile | undefined,
  ): Promise<TypeOf<typeof uploadAvatarResponseSchema>> {
    if (!data) {
      throw new NotFoundException('파일을 선택해주세요.');
    }
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(data.mimetype)) {
      throw new BadRequestException('PNG 또는 JPEG 파일만 사용할 수 있습니다.');
    }
    if (data.file.truncated) {
      throw new BadRequestException('파일 크기(최대 2MB)를 초과했습니다.');
    }

    this.ensureUploadDir(this.uploadDir);

    const ext = data.filename.split('.').pop();
    const filename = `${userId}-${uuidv4()}.${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    await this.saveFile(data.file, filepath);

    const imageUrl = `${this.baseUrl}/api/v1/uploads/avatars/${filename}`;

    await sendAvatarUploadEvent({ userId: userId, avatarUrl: imageUrl });

    return {
      status: STATUS.SUCCESS,
      message: '아바타 이미지가 업로드 되었습니다.',
    };
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

  private async saveFile(file: NodeJS.ReadableStream, filepath: string): Promise<void> {
    const pump = promisify(pipeline);
    try {
      await pump(file, fs.createWriteStream(filepath));
    } catch {
      throw new InternalServerException('파일 저장에 실패했습니다.');
    }
  }
}
