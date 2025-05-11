import { beforeEach, describe, expect, it } from 'vitest';
import LocalFileService from '../../../../src/v1/apis/file/local-file.service.js';

describe('LocalFileService', () => {
  let service: LocalFileService;

  beforeEach(() => {
    service = new LocalFileService(
      '/Users/woongbishin/WebstormProjects/file-server/uploads',
      'http://localhost:3000',
    );
  });

  it('upload 테스트', async () => {
    const result = await service.upload(Buffer.from('test message'), 'test.txt');
    console.log(result);
  });
});
