export default interface FileService {
  upload(fileBuffer: Buffer, key: string): Promise<string>;

  getUrl(key: string): string;
}
