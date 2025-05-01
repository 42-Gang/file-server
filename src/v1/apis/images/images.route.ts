import { FastifyInstance } from 'fastify';
import ImagesController from './images.controller.js';
import { addRoutes, Route } from '../../../plugins/router.js';
import { uploadAvatarResponseSchema } from './schemas/upload-avatar.schema.js';

export default async function imagesRoutes(fastify: FastifyInstance) {
  const imagesController: ImagesController = fastify.diContainer.resolve('imagesController');
  const routes: Array<Route> = [
    {
      method: 'POST',
      url: '/uploads',
      handler: imagesController.uploadAvatar,
      options: {
        schema: {
          tags: ['images'],
          description: '아바타 이미지 업로드',
          response: {
            200: uploadAvatarResponseSchema,
          },
        },
        auth: true,
      },
    },
  ];
  await addRoutes(fastify, routes);
}
