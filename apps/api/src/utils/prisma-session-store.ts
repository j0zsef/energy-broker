import { Session as FastifySession } from 'fastify';
import { prismaClient } from './prisma-client.js';

type Callback = (err?: unknown) => void;
type CallbackSession = (err: unknown, result?: FastifySession | null) => void;

export class PrismaSessionStore {
  set(sessionId: string, session: FastifySession, callback: Callback): void {
    const data = JSON.stringify(session);
    const expiresAt = session.cookie.expires
      ? new Date(session.cookie.expires)
      : new Date(Date.now() + (session.cookie.originalMaxAge ?? 86400000));

    prismaClient.session.upsert({
      create: { data, expiresAt, id: sessionId },
      update: { data, expiresAt },
      where: { id: sessionId },
    })
      .then(() => callback())
      .catch(err => callback(err));
  }

  get(sessionId: string, callback: CallbackSession): void {
    prismaClient.session.findUnique({ where: { id: sessionId } })
      .then((row) => {
        if (!row || row.expiresAt < new Date()) {
          return callback(null, null);
        }
        callback(null, JSON.parse(row.data));
      })
      .catch(err => callback(err));
  }

  destroy(sessionId: string, callback: Callback): void {
    prismaClient.session.delete({ where: { id: sessionId } })
      .then(() => callback())
      .catch((err) => {
        // Ignore "record not found" errors
        if ((err as { code?: string }).code === 'P2025') {
          return callback();
        }
        callback(err);
      });
  }
}
