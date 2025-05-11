import { TypeOf } from 'zod';
import { BadRequestException } from '../../common/exceptions/core.error.js';
import { STATUS } from '../../common/constants/status.js';
import { uploadAvatarResponseSchema } from './schemas/upload-avatar.schema.js';
import { MultipartFile } from '@fastify/multipart';
import { sendAvatarUploadEvent } from '../../kafka/producers/image.producer.js';
import LocalStorageService from './local-storage.service.js';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'];

export default class ImagesService {
  constructor(private readonly localStorageService: LocalStorageService) {}

  async uploadAvatar(
    userId: number,
    avatarFile: MultipartFile,
  ): Promise<TypeOf<typeof uploadAvatarResponseSchema>> {
    this.validateFile(avatarFile);

    const filename = await this.localStorageService.saveFile(avatarFile, userId);

    const imageUrl = '/api/v1/uploads/avatars/' + filename;
    await sendAvatarUploadEvent({ userId: userId, avatarUrl: imageUrl });

    return {
      status: STATUS.SUCCESS,
      message: '아바타 이미지가 업로드 되었습니다.',
    };
  }

  private validateFile(data: MultipartFile): void {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(data.mimetype)) {
      throw new BadRequestException('PNG 또는 JPEG 파일만 사용할 수 있습니다.');
    }
    if (data.file.truncated) {
      throw new BadRequestException('파일 크기(최대 2MB)를 초과했습니다.');
    }
  }
}
