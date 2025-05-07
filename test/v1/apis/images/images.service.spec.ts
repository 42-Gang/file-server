import { NotFoundException, BadRequestException } from '../../../../src/v1/common/exceptions/core.error.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImagesService from '../../../../src/v1/apis/images/images.service.js';
import { STATUS } from '../../../../src/v1/common/constants/status.js';
import { sendAvatarUploadEvent } from '../../../../src/v1/kafka/producers/image.producer.js';
import LocalStorageService from '../../../../src/v1/apis/images/local-storage.service.js';
import { MultipartFile } from '@fastify/multipart';

vi.mock('../../../../src/v1/kafka/producers/image.producer.js', () => ({
  sendAvatarUploadEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('ImagesService', () => {
  let imagesService: ImagesService;
  let localStorageService: LocalStorageService;

  beforeEach(() => {
    localStorageService = {
    saveFile: vi.fn().mockResolvedValue('mock-filename.png'),
    } as any;
    imagesService = new ImagesService(localStorageService);
  });

  const createMockFile = (options: Partial<MultipartFile & { truncated?: boolean }>): MultipartFile => {
    return {
      type: 'file',
      fieldname: 'avatar',
      filename: options.filename || 'avatar.png',
      encoding: '7bit',
      mimetype: options.mimetype || 'image/png',
      fields: {},
      toBuffer: async () => Buffer.from(''),
      file: {
        truncated: options.truncated ?? false,
      } as any,
    };
  };

  it('이미지 업로드 성공', async () => {
    const mockFile = createMockFile({});
    const result = await imagesService.uploadAvatar(1, mockFile);

    expect(localStorageService.saveFile).toHaveBeenCalled();
    expect(sendAvatarUploadEvent).toHaveBeenCalled();
    expect(result).toEqual({
      status: STATUS.SUCCESS,
      message: '아바타 이미지가 업로드 되었습니다.',
    });
  });

  it('파일이 없으면 NotFoundException 발생', async () => {
    await expect(imagesService.uploadAvatar(1, undefined)).rejects.toThrow(NotFoundException);
  });

  it('지원하지 않는 파일 형식이면 BadRequestException 발생', async () => {
    const mockFile = createMockFile({ mimetype: 'application/pdf' });
    await expect(imagesService.uploadAvatar(1, mockFile)).rejects.toThrow(BadRequestException);
  });

  it('파일 크기 초과면 BadRequestException 발생', async () => {
    const mockFile = createMockFile({ mimetype: 'image/png', truncated: true });
    await expect(imagesService.uploadAvatar(1, mockFile)).rejects.toThrow(BadRequestException);
  });
});