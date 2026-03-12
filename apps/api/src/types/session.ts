import 'fastify';
import { SessionData } from '@energy-broker/shared';

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Session extends SessionData {}

  interface FastifyRequest {
    user: { sub: string }
  }

  interface FastifyInstance {
    requireSession(): (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
