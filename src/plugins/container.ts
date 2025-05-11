import { FastifyInstance } from 'fastify';
import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix';
import { asClass, asValue, Lifetime } from 'awilix';
import prisma from './prisma.js';
import { gotClient } from './http.client.js';
import { ensureEnv } from '../v1/common/utils/env.js';

export async function setDiContainer(server: FastifyInstance) {
  server.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
    strictBooleanEnforced: true,
  });

  diContainer.register({
    prisma: asValue(prisma),
    logger: asValue(server.log),
    redisClient: asValue(server.redis),
    httpClient: asValue(gotClient),

    avatarUploadDir: asValue(ensureEnv(process.env.AVATAR_UPLOADS_DIR, 'AVATAR_UPLOADS_DIR')),
  });

  const NODE_EXTENSION = process.env.NODE_ENV == 'dev' ? 'ts' : 'js';
  await diContainer.loadModules(
    [
      `./**/src/**/*.repository.${NODE_EXTENSION}`,
      `./**/src/**/*.controller.${NODE_EXTENSION}`,
      `./**/src/**/*.service.${NODE_EXTENSION}`,
    ],
    {
      esModules: true,
      formatName: 'camelCase',
      resolverOptions: {
        lifetime: Lifetime.SINGLETON,
        register: asClass,
        injectionMode: 'CLASSIC',
      },
    },
  );
}
