import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalServerException } from '../../../../src/v1/common/exceptions/core.error.js';
import LocalStorageService from '../../../../src/v1/apis/images/local-storage.service.js';
import fs from 'fs';
import { promisify } from 'util';
import { MultipartFile } from '@fastify/multipart';

vi.mock('fs');
vi.mock('util', () => ({
  promisify: vi.fn(),
}));

function createMockStream() {
    return {
      pipe: vi.fn(),
      on: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
    };
}

describe('LocalStorageService', () => {
  let localStorageService: LocalStorageService;

  const mockFile = {
    filename: 'test.png',
    file: {
      pipe: vi.fn(),
      on: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AVATAR_UPLOADS_DIR = '/some/path';
    localStorageService = new LocalStorageService(process.env.AVATAR_UPLOADS_DIR);
  });
  
  it('디렉토리가 없으면 생성한다', async () => {
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      (fs.mkdirSync as vi.Mock).mockImplementation(() => {});
      (fs.createWriteStream as vi.Mock).mockReturnValue(createMockStream());
      (promisify as vi.Mock).mockReturnValue(vi.fn().mockResolvedValue(undefined));

      await expect(localStorageService.saveFile(mockFile, 1)).resolves.toBeDefined();
  });
  
  it('디렉토리 생성 중 에러 발생 시 예외', async () => {
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      (fs.mkdirSync as vi.Mock).mockImplementation(() => { throw new Error(); });

      await expect(localStorageService.saveFile(mockFile, 1)).rejects.toThrow(InternalServerException);
  });

  it('파일 저장 중 에러 발생 시 예외', async () => {
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      (fs.createWriteStream as vi.Mock).mockReturnValue(createMockStream());
      (promisify as vi.Mock).mockReturnValue(vi.fn().mockRejectedValue(new Error()));

      await expect(localStorageService.saveFile(mockFile, 1)).rejects.toThrow(InternalServerException);
  });

  it('이미지 로컬 저장 성공', async () => {
    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.createWriteStream as vi.Mock).mockReturnValue(createMockStream());
    (promisify as vi.Mock).mockReturnValue(vi.fn().mockResolvedValue(undefined));

    const result = await localStorageService.saveFile(mockFile, 1);
    expect(result).toMatch(/^\d{1}-[a-f0-9\-]{36}\.png$/);
  });
});
