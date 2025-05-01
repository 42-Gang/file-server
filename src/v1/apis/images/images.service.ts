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

    const ext = data.filename.split('.').pop();
    const filename = `${userId}-${uuidv4()}.${ext}`;
    const uploadDir = '../../../uploads/avatars';

    if (!this.ensureUploadDir(uploadDir)) {
      throw new InternalServerException('폴더 생성에 실패했습니다.');
    }

    const pump = promisify(pipeline);
    const filepath = path.join(uploadDir, filename);
    const result = await pump(data.file, fs.createWriteStream(filepath)) //pump()로 안정적으로 복사
      .then(() => true)
      .catch(() => false);
    if (!result) {
      throw new InternalServerException('파일 저장에 실패했습니다.');
    }

    // 서버에서 접근할 수 있는 URL을 설정
    const imageUrl = `http://localhost:3000/api/v1/uploads/avatars/${filename}`;
    console.log('imageUrl: ', imageUrl);

    await sendAvatarUploadEvent({ userId: userId, avatarUrl: imageUrl });

    return {
      status: STATUS.SUCCESS,
      message: '아바타 이미지가 업로드 되었습니다.',
    };
  }

  private ensureUploadDir(dirPath: string): boolean {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return true;
    } catch (err) {
      return false;
    }
  }
}
