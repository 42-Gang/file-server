import { FastifyReply, FastifyRequest } from 'fastify';
import ImagesService from './images.service.js';
import { parseUploadAvatarRequest } from './schemas/upload-avatar.schema.js';

export default class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  uploadAvatar = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    const avatarFile = parseUploadAvatarRequest(file);
    const result = await this.imagesService.uploadAvatar(request.userId, avatarFile);
    reply.code(200).send(result);
  };
}
