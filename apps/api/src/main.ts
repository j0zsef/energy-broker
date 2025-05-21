import Fastify from 'fastify';
import { app } from './app/app';
import { nodeConfig } from '@shared/node-config';

const host = nodeConfig.apiHost;
const port = nodeConfig.apiPort;

const server = Fastify({
  logger: true,
});

server.register(app);

server.listen({ host, port }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
