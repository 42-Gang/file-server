import { FastifyInstance } from 'fastify';
import { addRoutes, Route } from '../../../plugins/router.js';
import { coreResponseSchema } from '../../common/schema/core.schema.js';
import FileController from './file.controller.js';
import { getUrlQuerySchema, getUrlResponseSchema } from './schemas/get-url.schema.js';

export default async function fileRoutes(fastify: FastifyInstance) {
  const fileController: FileController = fastify.diContainer.resolve('fileController');
  const routes: Array<Route> = [
    {
      method: 'POST',
      url: '/',
      handler: fileController.upload,
      options: {
        schema: {
          tags: ['file'],
          description: '파일 업로드',
          response: {
            200: coreResponseSchema,
          },
        },
        auth: false,
        internalOnly: true,
      },
    },
    {
      method: 'GET',
      url: '/url',
      handler: fileController.getUrl,
      options: {
        schema: {
          tags: ['file'],
          description: '파일 URL 가져오기',
          querystring: getUrlQuerySchema,
          response: {
            200: getUrlResponseSchema,
          },
        },
        auth: false,
        internalOnly: true,
      },
    },
  ];
  await addRoutes(fastify, routes);
}
