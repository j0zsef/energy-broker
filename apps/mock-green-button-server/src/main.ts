import { OAuth2Server } from 'oauth2-mock-server';
import express from 'express';

import fetch from 'node-fetch';

const app = express();
const oauthServer = new OAuth2Server();
const OAUTH_PORT = 3001; // OAuth2 mock
const MOCK_GREEN_BUTTON_PORT = 3002; // Your usage endpoint

(async () => {
  // Start the OAuth2 mock server
  await oauthServer.issuer.keys.generate('RS256');
  await oauthServer.start(OAUTH_PORT);
  console.log(`OAuth2 mock server running at ${oauthServer.issuer.url}`);

  app.listen(MOCK_GREEN_BUTTON_PORT, () => {
    console.log(`Mock Green Button API running at http://localhost:${MOCK_GREEN_BUTTON_PORT}`);
  });

  app.use(express.json());

  app.post('/token', async (req, res) => {
    // Forward the request to the mock server
    const response = await fetch(`${oauthServer.issuer.url}/token`, {
      body: JSON.stringify(req.body),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });
    const data = await response.json() as Record<string, unknown>;

    // Add custom fields
    // TODO: update this to the mocked server :^)
    res.json({
      authorizationURI: 'https://utilityapi.com/DataCustodian/espi/1_1/resource/Authorization/1111',
      customerResourceURI: 'https://utilityapi.com/DataCustodian/espi/1_1/resource/RetailCustomer/1111',
      resourceURI: 'https://utilityapi.com/DataCustodian/espi/1_1/resource/Subscription/1111',
      ...data,
    });
  });

  app.get('/usage', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Missing token');
    }

    const token = authHeader.replace('Bearer ', '');

    type IntrospectResponse = {
      active: boolean
      scope?: string
      client_id?: string
      username?: string
      exp?: number
    };

    // Introspect token against mock OAuth server
    const introspectResp = await fetch(`${oauthServer.issuer.url}/introspect`, {
      body: `token=${token}&client_id=demo-client&client_secret=demo-secret`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',

    });
    const introspectData = await introspectResp.json() as IntrospectResponse;

    if (!introspectData.active) {
      return res.status(401).send('Invalid token');
    }

    // ✅ Token is valid, return fake usage data
    res.json({
      customerId: '12345',
      serviceAddress: '123 Main St',
      usageIntervals: [
        { kWh: 1.23, start: '2025-08-01T00:00:00Z' },
        { kWh: 0.98, start: '2025-08-01T01:00:00Z' },
        { kWh: 1.10, start: '2025-08-01T02:00:00Z' },
      ],
    });
  });
})();
