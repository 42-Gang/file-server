import { InternalServerException } from '../exceptions/core.error.js';

export function ensureEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new InternalServerException(`${name} 환경변수가 설정되어 있지 않습니다.`);
  }
  return value;
}
