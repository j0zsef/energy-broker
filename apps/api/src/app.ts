import { FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import Auth0 from '@auth0/auth0-fastify-api';
import autoload from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import { fastifyEnv } from '@fastify/env';
import sensible from '@fastify/sensible';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { authConfig } from "./config/auth-config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export async function app(fastify: FastifyInstance) {
  fastify.register(sensible);
  fastify.register(fastifyEnv, envOptions);
  fastify.register(fastifyCors, {
    origin: 'http://localhost:9200',
  });

  await Auth0(fastify, {
    audience: authConfig.auth0Audience,
    domain: authConfig.auth0Domain,
  });

  fastify.register(autoload, {
    dir: join(__dirname, 'routes'),
    options: { prefix: '' },
  });

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.ready(() => {
    console.log(fastify.printRoutes());
  });
}
