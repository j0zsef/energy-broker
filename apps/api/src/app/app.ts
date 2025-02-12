import * as path from 'path';
import { FastifyInstance } from 'fastify';
import { fastifyEnv } from '@fastify/env';
import AutoLoad from '@fastify/autoload';
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

/* eslint-disable-next-line */
export interface AppOptions {}

export type Envs = {
  GREEN_BUTTON_TOKEN: string;
}

const envOptions = {
  dotenv: true
}

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
