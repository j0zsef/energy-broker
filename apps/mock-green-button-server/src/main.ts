import { createOAuthRouter, createTokenValidator } from './mock-oauth/mock-oauth.js';
import { OAuth2Server } from 'oauth2-mock-server';
import cors from 'cors';
import { createGreenButtonRouter } from './mock-green-button-api/mock-green-button-api.js';
import express from 'express';

const OAUTH_PORT = 9500;
const MOCK_GREEN_BUTTON_PORT = 9501;

(async () => {
  // Start the OAuth2 mock server
  const oauthServer = new OAuth2Server();
  await oauthServer.issuer.keys.generate('RS256');
  await oauthServer.start(OAUTH_PORT);
  console.log(`OAuth2 mock server running at ${oauthServer.issuer.url}`);

  // Set up the Express app
  const app = express();
  app.use(express.json());
  app.use(cors({
    origin: ['http://localhost:9200', 'http://localhost:9400'],
  }));

  // Mount routers
  const validateToken = createTokenValidator(oauthServer);
  app.use(createOAuthRouter(oauthServer));
  app.use(createGreenButtonRouter(validateToken));

  app.listen(MOCK_GREEN_BUTTON_PORT, () => {
    console.log(`Mock Green Button API running at http://localhost:${MOCK_GREEN_BUTTON_PORT}`);
  });
})();
