import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STATUS } from '../../../../src/v1/common/constants/status.js';
import { gotClient } from '../../../../src/plugins/http.client.js';
import ImagesService from '../../../../src/v1/apis/images/images.service.js';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { Readable } from 'stream';
import { promisify } from 'util';

vi.mock('fs');
vi.mock('path');
vi.mock('util');
vi.mock('../../../../plugins/http.client');

describe('ImagesService', () => {
  let imagesService: ImagesService;
  const mockHttpClient = {
    request: vi.fn(),
  } as unknown as GotClient;

  beforeEach(() => {
    imagesService = new ImagesService(mockHttpClient);
    vi.resetAllMocks();
  });

  it('이미지 업로드 성공', async () => {
    // Mock file input
    const mockFileStream = new Readable();
    mockFileStream._read = () => {}; // dummy

    const mockRequest: any = {
      userId: '123',
      file: vi.fn().mockResolvedValue({
        filename: 'avatar.png',
        mimetype: 'image/png',
        file: mockFileStream,
        truncated: false,
      }),
    };

    // Mock fs
    (fs.existsSync as vi.Mock).mockReturnValue(false);
    (fs.mkdirSync as vi.Mock).mockImplementation(() => {});
    (fs.createWriteStream as vi.Mock).mockReturnValue({});

    // Mock pipeline
    const mockPump = vi.fn().mockResolvedValue(undefined);
    // @ts-ignore
    (promisify as vi.Mock).mockReturnValue(mockPump);

    // Mock HTTP call
    mockHttpClient.request.mockResolvedValue({ statusCode: 200 });

    const result = await imagesService.uploadAvatar(mockRequest);

    expect(result).toEqual({
      status: STATUS.SUCCESS,
      message: '아바타 이미지가 업로드 되었습니다.',
    });

    // expect(mockHttpClient.request).toHaveBeenCalled();
    expect(mockRequest.file).toHaveBeenCalled();
  });

  it('파일이 없으면 NotFoundException 발생', async () => {
    const mockRequest: any = {
      file: vi.fn().mockResolvedValue(null),
    };
  
    await expect(imagesService.uploadAvatar(mockRequest)).rejects.toThrow('파일을 선택해주세요.');
  });

  it('지원하지 않는 파일 형식이면 BadRequestException 발생', async () => {
    const mockRequest: any = {
      file: vi.fn().mockResolvedValue({
        filename: 'avatar.gif',
        mimetype: 'image/gif',
        file: new Readable(),
        truncated: false,
      }),
    };
    await expect(imagesService.uploadAvatar(mockRequest)).rejects.toThrow('PNG 또는 JPEG 파일만 사용할 수 있습니다.');
  });

  it('파일 크기 초과면 BadRequestException 발생', async () => {
    const mockFileStream = new Readable();
    mockFileStream._read = () => {};
  
    const mockRequest: any = {
      file: vi.fn().mockResolvedValue({
        filename: 'avatar.png',
        mimetype: 'image/png',
        file: mockFileStream,
        truncated: true, // 핵심: 여기서 true
      }),
      userId: '123',
    };
  
    await expect(imagesService.uploadAvatar(mockRequest)).rejects.toThrow('파일 크기(최대 2MB)를 초과했습니다.');
  });
});