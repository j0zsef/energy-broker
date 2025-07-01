import * as path from 'path';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import AutoLoad from '@fastify/autoload';
import { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import { fastifyEnv } from '@fastify/env';

/* eslint-disable-next-line */
export interface AppOptions {}

export type Envs = {
  GREEN_BUTTON_TOKEN: string
};

const envSchema = {
  properties: {
    GREEN_BUTTON_TOKEN: { type: 'string' },
  },
  required: ['GREEN_BUTTON_TOKEN'],
  type: 'object',
};

const envOptions = {
  confKey: 'config',
  dotenv: true,
  schema: envSchema,
};

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    maxDepth: 10,
    options: { ...opts },
  });

  fastify.register(fastifyCors, {
    origin: 'http://localhost:4200',
  });

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.register(fastifyEnv, envOptions);
}
