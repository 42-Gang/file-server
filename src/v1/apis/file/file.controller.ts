import FileService from './file.service.js';
import { BadRequestException } from '../../common/exceptions/core.error.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import { uploadBodySchema } from './upload.schema.js';

export default class FileController {
  constructor(private readonly localFileService: FileService) {}

  upload = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }
    const fileBuffer = await file.toBuffer();

    const body = uploadBodySchema.parse(request.body);
    const result = await this.localFileService.upload(fileBuffer, body.key);
    reply.status(200).send(result);
  };
}
