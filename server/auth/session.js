/**
 * Session helpers — GitHub tokens live in server-side sessions only.
 */

/** Persist GitHub auth data on the express-session object */
export function setGitHubSession(req, { accessToken, tokenType, scope, user }) {
  req.session.github = {
    accessToken,
    tokenType,
    scope,
    user,
    linkedAt: new Date().toISOString(),
  };
}

/** Read GitHub session or null if not linked */
export function getGitHubSession(req) {
  return req.session?.github ?? null;
}

/** Clear GitHub auth from session (logout) */
export function clearGitHubSession(req) {
  if (req.session?.github) {
    delete req.session.github;
  }
}

/** Public user payload — never includes the access token */
export function getPublicUser(req) {
  const session = getGitHubSession(req);
  if (!session?.user) return null;

  return {
    ...session.user,
    linkedAt: session.linkedAt,
    scope: session.scope,
  };
}

/** Retrieve access token for server-side GitHub API calls */
export function getAccessToken(req) {
  return getGitHubSession(req)?.accessToken ?? null;
}
