const { integrationsDB } = require('../models/database');

const GITHUB_TOKEN_ENDPOINT = 'https://github.com/login/oauth/access_token';

function expiresInToIso(expiresInSeconds) {
  const parsed = Number(expiresInSeconds);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return new Date(Date.now() + parsed * 1000).toISOString();
}

function isTokenExpired(expiresAt, skewMs = 60 * 1000) {
  if (!expiresAt) return false;
  const expiryMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryMs)) return false;
  return Date.now() + skewMs >= expiryMs;
}

async function refreshGitHubAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error('GitHub refresh token is missing.');
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth client credentials are missing in environment config.');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const response = await fetch(GITHUB_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const payload = await response.json();

  if (!response.ok || payload.error || !payload.access_token) {
    const details = payload.error_description || payload.error || payload.message || 'Unknown OAuth refresh error';
    throw new Error(`GitHub token refresh failed: ${details}`);
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || refreshToken,
    expiresAt: payload.expires_in ? expiresInToIso(payload.expires_in) : null,
    refreshTokenExpiresAt: payload.refresh_token_expires_in ? expiresInToIso(payload.refresh_token_expires_in) : null,
    scope: payload.scope || null,
    tokenType: payload.token_type || 'bearer'
  };
}

async function getValidGitHubToken(userId) {
  const github = integrationsDB[userId]?.github;

  if (!github?.accessToken) {
    return process.env.GITHUB_ACCESS_TOKEN || null;
  }

  if (github.refreshToken && isTokenExpired(github.expiresAt)) {
    const refreshed = await refreshGitHubAccessToken(github.refreshToken);
    github.accessToken = refreshed.accessToken;
    github.refreshToken = refreshed.refreshToken;
    github.expiresAt = refreshed.expiresAt;
    github.refreshTokenExpiresAt = refreshed.refreshTokenExpiresAt;
    github.scope = refreshed.scope;
    github.tokenType = refreshed.tokenType;
    github.connected = true;
  }

  return github.accessToken;
}

async function githubFetchWithAutoRefresh({ userId, url, options = {} }) {
  let token = await getValidGitHubToken(userId);

  if (!token) {
    throw new Error('GitHub authentication missing. Connect GitHub first.');
  }

  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status !== 401) {
    return response;
  }

  const github = integrationsDB[userId]?.github;
  if (!github?.refreshToken) {
    return response;
  }

  const refreshed = await refreshGitHubAccessToken(github.refreshToken);
  github.accessToken = refreshed.accessToken;
  github.refreshToken = refreshed.refreshToken;
  github.expiresAt = refreshed.expiresAt;
  github.refreshTokenExpiresAt = refreshed.refreshTokenExpiresAt;
  github.scope = refreshed.scope;
  github.tokenType = refreshed.tokenType;
  github.connected = true;

  token = github.accessToken;

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    }
  });
}

module.exports = {
  expiresInToIso,
  isTokenExpired,
  refreshGitHubAccessToken,
  getValidGitHubToken,
  githubFetchWithAutoRefresh
};