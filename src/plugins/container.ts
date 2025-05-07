import { FastifyInstance } from 'fastify';
import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix';
import { asClass, asValue, Lifetime } from 'awilix';
import prisma from './prisma.js';
import { gotClient } from './http.client.js';
import StorageService from '../v1/apis/images/local-storage.service.js';

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

    avatarUploadDir: asValue(process.env.AVATAR_UPLOADS_DIR),
    storageService: asClass(StorageService).singleton(),
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
