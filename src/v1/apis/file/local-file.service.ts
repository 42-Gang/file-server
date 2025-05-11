import FileService from './file.service.js';

export default class LocalFileService implements FileService {
  upload(buffer: Buffer, path: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  delete(path: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getUrl(path: string): string {
    throw new Error('Method not implemented.');
  }
}
