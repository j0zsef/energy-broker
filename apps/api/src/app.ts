import { dirname, join } from 'node:path';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { FastifyInstance } from 'fastify';
import { PrismaSessionStore } from './utils/prisma-session-store.js';
import autoload from '@fastify/autoload';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { fastifyEnv } from '@fastify/env';
import fastifySession from '@fastify/session';
import { fileURLToPath } from 'node:url';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import sessionAuth from './plugins/session-auth.js';

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

const isProduction = process.env.NODE_ENV === 'production';

export async function app(fastify: FastifyInstance) {
  fastify.register(sensible);
  fastify.register(fastifyEnv, envOptions);
  fastify.register(fastifyCors, {
    credentials: true,
    origin: process.env.FRONTEND_URL || 'http://localhost:9200',
  });

  fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        scriptSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
      },
    },
  });

  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
    },
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me-in-production!!',
    store: new PrismaSessionStore(),
  });

  fastify.register(sessionAuth);

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
