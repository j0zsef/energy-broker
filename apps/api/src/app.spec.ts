import Fastify, { FastifyInstance } from 'fastify';
import { app } from './app';

describe('app', () => {
  let server: FastifyInstance;

  beforeEach(() => {
    server = Fastify();
    server.register(app);
  });

  afterEach(async () => {
    await server.close();
  });

  it('should register without errors', async () => {
    await server.ready();
    expect(server).toBeDefined();
  });
});
