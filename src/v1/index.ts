import { FastifyInstance } from 'fastify';

import imagesRoutes from './apis/images/images.route.js';

export default async function routeV1(fastify: FastifyInstance) {
  fastify.register(imagesRoutes, { prefix: '/images' });
}
