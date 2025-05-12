import { FastifyInstance } from 'fastify';
import { addRoutes, Route } from '../../../plugins/router.js';
import FileController from './file.controller.js';
import { getUrlQuerySchema, getUrlResponseSchema } from './schemas/get-url.schema.js';
import { fastifyStatic } from '@fastify/static';
import { uploadResponseSchema } from './schemas/upload.schema.js';

export default async function fileRoutes(fastify: FastifyInstance) {
  const fileController: FileController = fastify.diContainer.resolve('fileController');
  const baseDir: string = fastify.diContainer.resolve('baseDir');
  if (!baseDir) {
    throw new Error('baseDir is not defined');
  }

  fastify.register(fastifyStatic, {
    root: baseDir,
  });

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
            201: uploadResponseSchema,
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
