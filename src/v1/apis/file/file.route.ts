import { FastifyInstance } from 'fastify';
import { addRoutes, Route } from '../../../plugins/router.js';
import { coreResponseSchema } from '../../common/schema/core.schema.js';
import FileController from './file.controller.js';
import { uploadBodySchema } from './upload.schema.js';

export default async function fileRoutes(fastify: FastifyInstance) {
  const fileController: FileController = fastify.diContainer.resolve('fileController');
  const routes: Array<Route> = [
    {
      method: 'POST',
      url: '/uploads',
      handler: fileController.upload,
      options: {
        schema: {
          tags: ['file'],
          description: '파일 업로드',
          body: uploadBodySchema,
          response: {
            200: coreResponseSchema,
          },
        },
        auth: true,
        internalOnly: true,
      },
    },
  ];
  await addRoutes(fastify, routes);
}
