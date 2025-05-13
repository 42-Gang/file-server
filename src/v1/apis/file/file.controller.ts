import FileService from './services/file.service.js';
import { BadRequestException } from '../../common/exceptions/core.error.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import { getUrlQuerySchema } from './schemas/get-url.schema.js';
import { STATUS } from '../../common/constants/status.js';

export default class FileController {
  constructor(private readonly localFileService: FileService) {}

  upload = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }
    const key = file.fieldname;
    if (!key) {
      throw new BadRequestException('파일 키가 제공되지 않았습니다.');
    }
    const fileBuffer = await file.toBuffer();

    const result = await this.localFileService.upload(fileBuffer, key);
    reply.status(201).send(result);
  };

  getUrl = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = getUrlQuerySchema.parse(request.query);
    const url = this.localFileService.getUrl(query.key);
    reply.status(200).send({
      status: STATUS.SUCCESS,
      data: {
        url,
      },
    });
  };
}
