import { FastifyRequest } from 'fastify';
import { TypeOf } from 'zod';
import { NotFoundException, BadRequestException } from '../../common/exceptions/core.error.js';
import { STATUS } from '../../common/constants/status.js';
import { uploadAvatarResponseSchema } from './schemas/upload-avatar.schema.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import path from 'path';
// import { GotClient } from '../../../plugins/http.client.js';

export default class ImagesService {
  // constructor(private httpClient: GotClient) {}

  async uploadAvatar(request: FastifyRequest): Promise<TypeOf<typeof uploadAvatarResponseSchema>> {
    const data = await request.file();
    if (!data) {
      throw new NotFoundException('파일을 선택해주세요.');
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(data.mimetype)) {
      throw new BadRequestException('PNG 또는 JPEG 파일만 사용할 수 있습니다.');
    }

    if (data.truncated) {
      throw new BadRequestException('파일 크기(최대 2MB)를 초과했습니다.');
    }

    const ext = data.filename.split('.').pop();
    const filename = `${request.userId}-${uuidv4()}.${ext}`;
    const uploadDir = '/goinfre/inryu/image-server/uploads/avatars';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); //recursive: true 하위 폴더도 같이 생성
    }

    const pump = promisify(pipeline);
    const filepath = path.join(uploadDir, filename);
    await pump(data.file, fs.createWriteStream(filepath)); //pump()로 안정적으로 복사

    // 서버에서 접근할 수 있는 URL을 설정
    const imageUrl = `http://localhost:3000/api/v1/uploads/avatars/${filename}`;
    console.log('imageUrl: ', imageUrl);

    //유저서버에 avatarUrl 변경 HTTP 요청 전송
    // const response = await this.httpClient.request({
    //   method: 'PATCH',
    //   url: `http://${process.env.USER_SERVER_URL}/api/v1/users/me/avatar`,
    //   headers: {
    //     'x-internal': 'true',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ avatarUrl: imageUrl }),
    // });
    // console.log('response: ', response);

    return {
      status: STATUS.SUCCESS,
      message: '아바타 이미지가 업로드 되었습니다.',
    };
  }
}
