import Fastify from 'fastify';
import { app } from './app/app';
import { nodeConfig } from '@shared/node-config';

const host = nodeConfig.apiHost;
const port = nodeConfig.apiPort;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ host, port }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
