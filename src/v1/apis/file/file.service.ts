export default interface FileService {
  upload(fileBuffer: Buffer, key: string): Promise<void>;

  delete(key: string): Promise<void>;

  getUrl(key: string): string;
}
