import Fastify from 'fastify';
import { app } from './app.js';
import { apiConfig } from './config/api-config.js';

const host = apiConfig.apiHost;
const port = apiConfig.apiPort;

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
