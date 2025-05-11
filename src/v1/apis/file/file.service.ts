export default interface FileService {
  upload(buffer: Buffer, path: string): Promise<void>;

  delete(path: string): Promise<void>;

  getUrl(path: string): string;
}
