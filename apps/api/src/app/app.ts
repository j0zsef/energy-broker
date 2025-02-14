import { FastifyInstance } from 'fastify';
import { fastifyEnv } from '@fastify/env';
import AutoLoad from '@fastify/autoload';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import * as path from 'path';

/* eslint-disable-next-line */
export interface AppOptions {}

export type Envs = {
  GREEN_BUTTON_TOKEN: string
}

const envSchema = {
  type: 'object',
  required: ['GREEN_BUTTON_TOKEN'], // List required env variables
  properties: {
    GREEN_BUTTON_TOKEN: { type: 'string' },
  },
};

const envOptions = {
  confKey: 'config', // Access via fastify.config
  schema: envSchema,
  dotenv: true, // Load from .env file
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

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.register(fastifyEnv, envOptions);
}
