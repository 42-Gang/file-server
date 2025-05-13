import { beforeEach, describe, expect, it, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import LocalFileService from '../../../../src/v1/apis/file/services/local-file.service.js';
import { BadRequestException } from '../../../../src/v1/common/exceptions/core.error.js';

const baseDir = '/Users/woongbishin/WebstormProjects/file-server/uploads';
const baseUrl = 'http://localhost:3000';
const testKey = 'test.txt';
const testContent = Buffer.from('test message');
const testPath = path.join(baseDir, testKey);

describe('LocalFileService', () => {
  let service: LocalFileService;

  beforeEach(() => {
    service = new LocalFileService(baseDir, baseUrl);
    // 테스트 전 파일 삭제(있으면)
    if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  });

  afterEach(() => {
    // 테스트 후 파일 삭제(있으면)
    if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  });

  it('upload는 파일을 생성하고 URL을 반환한다', async () => {
    const result = await service.upload(testContent, testKey);
    expect(fs.existsSync(testPath)).toBe(true);
    expect(result).toBe(`${baseUrl}/${testKey}`);
    expect(fs.readFileSync(testPath).toString()).toBe('test message');
  });

  it('getUrl은 올바른 URL을 반환한다', () => {
    const result = service.getUrl(testKey);
    expect(result).toBe(`${baseUrl}/${testKey}`);
  });

  it('upload는 중첩 경로 생성 불가', async () => {
    const nestedKey = 'nested/test2.txt';
    const nestedPath = path.join(baseDir, nestedKey);
    if (fs.existsSync(nestedPath)) fs.unlinkSync(nestedPath);
    await expect(service.upload(testContent, nestedKey)).rejects.toThrow(BadRequestException);
  });
});
