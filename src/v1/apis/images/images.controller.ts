import { FastifyReply, FastifyRequest } from 'fastify';
import ImagesService from './images.service.js';

export default class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  uploadAvatar = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();
    const result = await this.imagesService.uploadAvatar(request.userId, data);
    reply.code(200).send(result);
  };
}
