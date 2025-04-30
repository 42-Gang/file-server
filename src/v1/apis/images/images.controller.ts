import { FastifyReply, FastifyRequest } from 'fastify';
import ImagesService from './images.service.js';

export default class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  uploadAvatar = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.imagesService.uploadAvatar(request);
    reply.code(200).send(result);
  };
}
