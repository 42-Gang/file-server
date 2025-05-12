import { FastifyInstance } from 'fastify';
import fileRoutes from './apis/file/file.route.js';

export default async function routeV1(fastify: FastifyInstance) {
  fastify.register(fileRoutes, { prefix: '/file' });
}
