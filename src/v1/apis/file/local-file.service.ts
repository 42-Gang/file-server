import FileService from './file.service.js';

export default class LocalFileService implements FileService {
  upload(fileBuffer: Buffer, key: string): Promise<void> {
    console.log(fileBuffer);
    console.log(key);
    throw new Error('Method not implemented.');
  }

  delete(key: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getUrl(key: string): string {
    throw new Error('Method not implemented.');
  }
}
