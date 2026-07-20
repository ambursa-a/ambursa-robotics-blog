/**
 * GitHub OAuth 2.0 helpers and API client.
 * Token exchange runs server-side only — never expose the client secret to the browser.
 */
import crypto from 'node:crypto';
import { config } from './config.js';

/** OAuth scopes joined for the authorize URL */
export function getScopes() {
  return config.github.scopes.join(' ');
}

/** Build the GitHub authorization redirect URL with CSRF state */
export function buildAuthorizeUrl(state) {
  const params = new URLSearchParams({
    client_id: config.github.clientId,
    redirect_uri: config.github.callbackUrl,
    scope: getScopes(),
    state,
  });
  return `${config.github.authorizeUrl}?${params.toString()}`;
}

/** Generate a cryptographically secure OAuth state token */
export function generateState() {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Exchange an authorization code for an access token.
 * @returns {{ accessToken: string, tokenType: string, scope: string }}
 */
export async function exchangeCodeForToken(code) {
  const response = await fetch(config.github.tokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code,
      redirect_uri: config.github.callbackUrl,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const message = data.error_description || data.error || 'Token exchange failed';
    throw new GitHubAuthError(message, response.status || 400);
  }

  if (!data.access_token) {
    throw new GitHubAuthError('No access token returned from GitHub', 502);
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || 'bearer',
    scope: data.scope || '',
  };
}

/**
 * Fetch the authenticated user's GitHub profile.
 */
export async function fetchGitHubUser(accessToken) {
  const response = await githubFetch('/user', accessToken);
  const user = await response.json();

  if (!response.ok) {
    throw GitHubAuthError.fromResponse(response, user);
  }

  return {
    id: user.id,
    login: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    bio: user.bio,
    publicRepos: user.public_repos,
  };
}

/**
 * Fetch contribution calendar via GitHub GraphQL (last ~1 year).
 */
export async function fetchContributionCalendar(accessToken, login) {
  const now = new Date();
  const from = new Date(now);
  from.setFullYear(from.getFullYear() - 1);

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(config.github.graphqlUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({
      query,
      variables: {
        login,
        from: from.toISOString(),
        to: now.toISOString(),
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.[0]?.message || 'Failed to fetch contributions';
    throw new GitHubAuthError(message, response.status || 502);
  }

  const calendar =
    payload.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar) {
    throw new GitHubAuthError('Contribution data unavailable', 404);
  }

  return normalizeContributionCalendar(calendar);
}

/**
 * Fetch the user's public repositories sorted by last update.
 */
export async function fetchUserRepos(accessToken, limit = 6) {
  const params = new URLSearchParams({
    sort: 'updated',
    direction: 'desc',
    per_page: String(limit),
    type: 'owner',
  });

  const response = await githubFetch(`/user/repos?${params}`, accessToken);
  const repos = await response.json();

  if (!response.ok) {
    throw GitHubAuthError.fromResponse(response, repos);
  }

  return repos.map((repo) => ({
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    updatedAt: repo.updated_at,
  }));
}

/** Normalize GraphQL calendar into a flat day list for the heatmap renderer */
export function normalizeContributionCalendar(calendar) {
  const days = calendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: countToLevel(day.contributionCount),
    }))
  );

  return {
    totalContributions: calendar.totalContributions,
    days,
  };
}

/** Map raw contribution counts to heatmap intensity levels (0–4) */
export function countToLevel(count) {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

/** Authenticated fetch wrapper for GitHub REST API */
async function githubFetch(path, accessToken) {
  return fetch(`${config.github.apiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

/** Structured error for OAuth and GitHub API failures */
export class GitHubAuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.name = 'GitHubAuthError';
    this.statusCode = statusCode;
  }

  static fromResponse(response, body) {
    const message = body?.message || `GitHub API error (${response.status})`;
    return new GitHubAuthError(message, response.status);
  }

  get isUnauthorized() {
    return this.statusCode === 401 || this.statusCode === 403;
  }
}
