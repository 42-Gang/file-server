export default interface FileService {
  upload(fileBuffer: Buffer, key: string): Promise<string>;

  delete(key: string): Promise<void>;

  getUrl(key: string): string;
}
