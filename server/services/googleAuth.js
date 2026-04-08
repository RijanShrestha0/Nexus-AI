const { integrationsDB } = require('../models/database');

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

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

async function refreshGoogleAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error('Google refresh token is missing.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth client credentials are missing in environment config.');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const payload = await response.json();

  if (!response.ok || payload.error || !payload.access_token) {
    const details = payload.error_description || payload.error || payload.message || 'Unknown OAuth refresh error';
    throw new Error(`Google token refresh failed: ${details}`);
  }

  return {
    accessToken: payload.access_token,
    expiresAt: payload.expires_in ? expiresInToIso(payload.expires_in) : null,
    scope: payload.scope || null,
    tokenType: payload.token_type || 'Bearer'
  };
}

async function getValidGoogleToken(userId) {
  const gmail = integrationsDB[userId]?.gmail;

  if (!gmail?.accessToken) {
    return process.env.GOOGLE_ACCESS_TOKEN || null;
  }

  if (gmail.refreshToken && isTokenExpired(gmail.expiresAt)) {
    const refreshed = await refreshGoogleAccessToken(gmail.refreshToken);
    gmail.accessToken = refreshed.accessToken;
    gmail.expiresAt = refreshed.expiresAt;
    gmail.scope = refreshed.scope;
    gmail.tokenType = refreshed.tokenType;
    gmail.connected = true;
  }

  return gmail.accessToken;
}

async function googleFetchWithAutoRefresh({ userId, url, options = {} }) {
  let token = await getValidGoogleToken(userId);

  if (!token) {
    throw new Error('Google authentication missing. Connect Google Workspace first.');
  }

  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status !== 401) {
    return response;
  }

  const gmail = integrationsDB[userId]?.gmail;
  if (!gmail?.refreshToken) {
    return response;
  }

  const refreshed = await refreshGoogleAccessToken(gmail.refreshToken);
  gmail.accessToken = refreshed.accessToken;
  gmail.expiresAt = refreshed.expiresAt;
  gmail.scope = refreshed.scope;
  gmail.tokenType = refreshed.tokenType;
  gmail.connected = true;

  token = gmail.accessToken;

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
  refreshGoogleAccessToken,
  getValidGoogleToken,
  googleFetchWithAutoRefresh
};