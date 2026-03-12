import * as client from 'openid-client';

let config: client.Configuration | null = null;

export async function getOidcConfig(): Promise<client.Configuration> {
  if (config) return config;

  const domain = process.env.AUTH0_DOMAIN || '';
  const clientId = process.env.AUTH0_CLIENT_ID || '';
  const clientSecret = process.env.AUTH0_CLIENT_SECRET || '';

  const issuer = new URL(`https://${domain}`);

  config = await client.discovery(
    issuer,
    clientId,
    { token_endpoint_auth_method: 'client_secret_post' },
    client.ClientSecretPost(clientSecret),
  );

  return config;
}
