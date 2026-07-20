/**
 * Server configuration loaded from environment variables.
 */
import 'dotenv/config';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  github: {
    clientId: requireEnv('GITHUB_CLIENT_ID'),
    clientSecret: requireEnv('GITHUB_CLIENT_SECRET'),
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback',
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    apiUrl: 'https://api.github.com',
    graphqlUrl: 'https://api.github.com/graphql',
    // Scopes for profile, repos, and contribution calendar
    scopes: ['read:user', 'public_repo'],
  },

  session: {
    secret: requireEnv('SESSION_SECRET'),
    maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
};
