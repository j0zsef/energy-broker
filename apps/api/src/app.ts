import * as summary from './routes/v1/connections/summary';
import * as usage from './routes/v1/connections/usage';
import * as connection from './routes/v1/energy-providers/connection';
import * as connections from './routes/v1/energy-providers/connections';
import * as energyProviders from './routes/v1/energy-providers/energy-providers';
import * as oauthConfig from './routes/v1/energy-providers/oauth-config';

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import Auth0 from '@auth0/auth0-fastify-api';

import fastifyCors from '@fastify/cors';
import { fastifyEnv } from '@fastify/env';
import { nodeEnvVars } from '@energy-broker/shared';
import sensible from '@fastify/sensible';

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

export async function app(fastify: FastifyInstance) {
  fastify.register(sensible);

  fastify.register(summary as FastifyPluginAsync);

  fastify.register(fastifyCors, {
    origin: 'http://localhost:4200',
  });

  await Auth0(fastify, {
    audience: nodeEnvVars.auth0Audience,
    domain: nodeEnvVars.auth0Domain,
  });

  fastify.register(fastifyEnv, envOptions);

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.ready(() => {
    console.log(fastify.printRoutes());
  });
}
