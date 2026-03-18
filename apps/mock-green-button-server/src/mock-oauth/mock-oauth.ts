import { NextFunction, Request, Response, Router } from 'express';
import { OAuth2Server } from 'oauth2-mock-server';
import fetch from 'node-fetch';

export type TokenValidator = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function createOAuthRouter(oauthServer: OAuth2Server): Router {
  const router = Router();

  router.post('/token', async (req, res) => {
    const response = await fetch(`${oauthServer.issuer.url}/token`, {
      body: JSON.stringify(req.body),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });
    const data = await response.json() as Record<string, unknown>;

    res.json({
      authorizationURI: 'http://localhost:9500/authorize',
      customerResourceURI: 'http://localhost:9501/espi/1_1/resource/Subscription/1',
      resourceURI: 'http://localhost:9501',
      ...data,
    });
  });

  return router;
}

export function createTokenValidator(oauthServer: OAuth2Server): TokenValidator {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).send('Missing token');
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    type IntrospectResponse = {
      active: boolean
    };

    const introspectResp = await fetch(`${oauthServer.issuer.url}/introspect`, {
      body: `token=${token}&client_id=demo-client&client_secret=demo-secret`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
    const introspectData = await introspectResp.json() as IntrospectResponse;

    if (!introspectData.active) {
      res.status(401).send('Invalid token');
      return;
    }

    next();
  };
}
