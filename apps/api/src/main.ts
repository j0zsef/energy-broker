import Fastify from 'fastify';
import { app } from './app/app';
import { nodeEnvVars } from '../../../libs/shared/src/config/node-env-vars';

const host = nodeEnvVars.apiHost;
const port = nodeEnvVars.apiPort;

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
