import { NotFoundException, BadRequestException, InternalServerException } from '../../../../src/v1/common/exceptions/core.error.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImagesService from '../../../../src/v1/apis/images/images.service.js';
import { STATUS } from '../../../../src/v1/common/constants/status.js';
import fs from 'fs';
import { Readable } from 'stream';
import { promisify } from 'util';
import { sendAvatarUploadEvent } from '../../../../src/v1/kafka/producers/image.producer.js';

vi.mock('fs');
vi.mock('util', () => ({
  promisify: vi.fn(),
}));
vi.mock('../../../../src/v1/kafka/producers/image.producer.js', () => ({
  sendAvatarUploadEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('ImagesService', () => {
  let imagesService: ImagesService;

  beforeEach(() => {
    imagesService = new ImagesService;
  });

  const createMockFile = (options: Partial<MultipartFile & { truncated?: boolean }>): MultipartFile => {
    const stream = new Readable();
    stream._read = () => {};
    stream.push(null);
    if (options.truncated) (stream as any).truncated = true;

    return {
      type: 'file',
      fieldname: 'avatar',
      filename: options.filename || 'avatar.png',
      encoding: '7bit',
      mimetype: options.mimetype || 'image/png',
      fields: {},
      toBuffer: async () => Buffer.from(''),
      file: stream as any,
    };
  };

  const mockUserId = 1;

  it('이미지 업로드 성공', async () => {
    const mockFile = createMockFile({ filename: 'avatar.png', mimetype: 'image/png' });

    (fs.existsSync as vi.Mock).mockReturnValue(false);
    (fs.mkdirSync as vi.Mock).mockImplementation(() => {});
    (fs.createWriteStream as vi.Mock).mockReturnValue({});
    const mockPump = vi.fn().mockResolvedValue(undefined);
    (promisify as vi.Mock).mockReturnValue(mockPump);
    // Mock HTTP call
    const result = await imagesService.uploadAvatar(mockUserId, mockFile);

    expect(result.status).toBe(STATUS.SUCCESS);
    expect(result.message).toBe('아바타 이미지가 업로드 되었습니다.');
  });

  it('파일이 없으면 NotFoundException 발생', async () => {
    await expect(imagesService.uploadAvatar(mockUserId, undefined)).rejects.toThrow(NotFoundException);
  });

  it('지원하지 않는 파일 형식이면 BadRequestException 발생', async () => {
    const mockFile = createMockFile({ mimetype: 'application/pdf' });
    await expect(imagesService.uploadAvatar(mockUserId, mockFile)).rejects.toThrow(BadRequestException);
  });

  it('파일 크기 초과면 BadRequestException 발생', async () => {
    const mockFile = createMockFile({ mimetype: 'image/png', truncated: true });
    await expect(imagesService.uploadAvatar(mockUserId, mockFile)).rejects.toThrow(BadRequestException);
  });

  it('디렉토리 생성 실패 시 InternalServerException 발생', async () => {
    const mockFile = createMockFile({ filename: 'avatar.png' });
    (fs.existsSync as vi.Mock).mockReturnValue(false);
    (fs.mkdirSync as vi.Mock).mockImplementation(() => { throw new Error(); });
  
    await expect(imagesService.uploadAvatar(mockUserId, mockFile)).rejects.toThrow(InternalServerException);
  });

  it('파일 저장 실패 시 InternalServerException 발생', async () => {
    const mockFile = createMockFile({ filename: 'avatar.png' });
  
    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.createWriteStream as vi.Mock).mockReturnValue({});
    const mockPump = vi.fn().mockRejectedValue(new Error());
    (promisify as vi.Mock).mockReturnValue(mockPump);
  
    await expect(imagesService.uploadAvatar(mockUserId, mockFile)).rejects.toThrow(InternalServerException);
  });
});