import { FastifyInstance } from 'fastify';
import fileRoutes from './apis/file/file.route.js';
import { context, trace } from '@opentelemetry/api';

export default async function routeV1(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, _) => {
    const span = trace.getSpan(context.active());
    if (!span) return;

    span.updateName(`${request.method} ${request.url}`);
  });

  fastify.register(fileRoutes, { prefix: '/file' });
}
