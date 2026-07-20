/**
 * Middleware — require an active GitHub-linked session for protected routes.
 */
import { getAccessToken } from '../auth/session.js';

export function requireGitHubAuth(req, res, next) {
  const token = getAccessToken(req);

  if (!token) {
    return res.status(401).json({
      error: 'authentication_required',
      message: 'Link your GitHub account to access this resource.',
    });
  }

  req.githubAccessToken = token;
  next();
}
