const { agentsDB, integrationsDB, logsDB } = require('../models/database');
const {
  expiresInToIso,
  githubFetchWithAutoRefresh,
  refreshGitHubAccessToken
} = require('../services/githubAuth');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const {
  expiresInToIso: googleExpiresInToIso,
  googleFetchWithAutoRefresh,
  refreshGoogleAccessToken
} = require('../services/googleAuth');

const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const DEFAULT_GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5005/api/dashboard/integrations/google/callback';

function ensureUserIntegrations(userId) {
  if (!integrationsDB[userId]) {
    integrationsDB[userId] = {
      slack: { connected: false },
      github: {
        connected: !!process.env.GITHUB_ACCESS_TOKEN,
        accessToken: process.env.GITHUB_ACCESS_TOKEN || null,
        refreshToken: null,
        expiresAt: null,
        refreshTokenExpiresAt: null,
        username: null,
        scope: null,
        tokenType: null
      },
      postgres: { connected: false },
      gmail: {
        connected: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        email: null,
        scope: null,
        tokenType: null
      }
    };
  }

  if (!integrationsDB[userId].gmail || typeof integrationsDB[userId].gmail !== 'object') {
    integrationsDB[userId].gmail = {
      connected: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      email: null,
      scope: null,
      tokenType: null
    };
  }
}

/** Estimated hours saved per successful execution (used for overview time-saved and trends). */
const HOURS_PER_SUCCESS = 0.5;

function successRateFromLogs(logs) {
  if (!logs.length) return null;
  const errors = logs.filter((l) => l.type === 'ERROR').length;
  return ((logs.length - errors) / logs.length) * 100;
}

exports.getMetrics = (req, res) => {
  const userId = req.user.id;
  const userAgents = agentsDB.filter((a) => a.userId === userId);
  const userLogs = logsDB.filter((l) => l.userId === userId);

  const now = Date.now();
  const MS_7D = 7 * 86400000;
  const currentStart = now - MS_7D;
  const prevStart = now - 2 * MS_7D;

  const logsInRange = (start, end) =>
    userLogs.filter((l) => {
      const t = new Date(l.timestamp).getTime();
      return t >= start && t < end;
    });

  const logsLast7d = logsInRange(currentStart, now);
  const logsPrev7d = logsInRange(prevStart, currentStart);

  if (userAgents.length === 0 && userLogs.length === 0) {
    return res.json({
      metrics: {
        tasksExecuted: '0',
        activeAgents: 0,
        successRate: '0.0%',
        timeSaved: '0.0h',
        trends: { tasks: '0%', agents: '0', success: '0%', time: '0%' }
      }
    });
  }

  const tasksExecuted = userLogs.length;
  const activeAgents = userAgents.filter((a) => a.status !== 'Inactive').length;

  const errorLogs = userLogs.filter((l) => l.type === 'ERROR');
  const successCount = userLogs.length - errorLogs.length;
  const successRate =
    userLogs.length === 0
      ? '0.0%'
      : ((successCount / userLogs.length) * 100).toFixed(1) + '%';

  const timeSavedValue = (successCount * HOURS_PER_SUCCESS).toFixed(1);

  const nLast = logsLast7d.length;
  const nPrev = logsPrev7d.length;
  let tasksTrend = '0%';
  if (nPrev === 0 && nLast === 0) tasksTrend = '0%';
  else if (nPrev === 0) tasksTrend = nLast > 0 ? '+100%' : '0%';
  else {
    const pct = ((nLast - nPrev) / nPrev) * 100;
    tasksTrend = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
  }

  const newAgentsLast7d = userAgents.filter((a) => {
    const t = new Date(a.createdAt).getTime();
    return t >= currentStart && t <= now;
  }).length;
  const newAgentsPrev7d = userAgents.filter((a) => {
    const t = new Date(a.createdAt).getTime();
    return t >= prevStart && t < currentStart;
  }).length;
  let agentsTrend = '0';
  if (newAgentsPrev7d === 0 && newAgentsLast7d === 0) agentsTrend = '0';
  else if (newAgentsPrev7d === 0) agentsTrend = newAgentsLast7d > 0 ? `+${newAgentsLast7d}` : '0';
  else {
    const pct = ((newAgentsLast7d - newAgentsPrev7d) / newAgentsPrev7d) * 100;
    agentsTrend = (pct >= 0 ? '+' : '') + pct.toFixed(0) + '%';
  }

  const srLast = successRateFromLogs(logsLast7d);
  const srPrev = successRateFromLogs(logsPrev7d);
  let successTrend = '0%';
  if (srLast === null && srPrev === null) successTrend = '0%';
  else if (srPrev === null) {
    successTrend = srLast !== null && srLast > 0 ? `+${srLast.toFixed(1)}pp` : '0%';
  } else if (srLast === null) successTrend = '0%';
  else {
    const diff = srLast - srPrev;
    successTrend = (diff >= 0 ? '+' : '') + diff.toFixed(1) + 'pp';
  }

  const succLast = logsLast7d.filter((l) => l.type !== 'ERROR').length;
  const succPrev = logsPrev7d.filter((l) => l.type !== 'ERROR').length;
  const hoursLast = succLast * HOURS_PER_SUCCESS;
  const hoursPrev = succPrev * HOURS_PER_SUCCESS;
  let timeTrend = '0%';
  if (hoursPrev === 0 && hoursLast === 0) timeTrend = '0%';
  else if (hoursPrev === 0) timeTrend = hoursLast > 0 ? '+100%' : '0%';
  else {
    const pct = ((hoursLast - hoursPrev) / hoursPrev) * 100;
    timeTrend = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
  }

  res.json({
    metrics: {
      tasksExecuted: tasksExecuted.toLocaleString(),
      activeAgents,
      successRate,
      timeSaved: timeSavedValue + 'h',
      trends: {
        tasks: tasksTrend,
        agents: agentsTrend,
        success: successTrend,
        time: timeTrend
      }
    }
  });
};

exports.getActiveAgents = (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  
  const userAgents = agentsDB
    .filter(a => a.userId === userId)
    .map(agent => {
      const createdAt = new Date(agent.createdAt);
      const ageSeconds = (now - createdAt) / 1000;
      
      // Status remains Active if toggled manually, otherwise syncs bootstrap status
      if (agent.status === 'Initializing' && ageSeconds > 6) {
        agent.status = 'Active';
      }
      return agent;
    });

  res.json({ agents: userAgents });
};

exports.toggleAgentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const agent = agentsDB.find(a => a.id === id && a.userId === userId);
  if (agent) {
    if (status !== 'Active' && status !== 'Inactive') {
      return res.status(400).json({ error: 'Status must be Active or Inactive.' });
    }
    agent.status = status;
    res.json({ message: `Agent Unit ${id} status toggled manually.`, agent });
  } else {
    res.status(404).json({ error: 'Agent unit mapping not found.' });
  }
};

exports.addAgent = (req, res) => {
  const { name, type, config } = req.body;
  const userId = req.user.id;

  const newAgent = {
    id: 'agent_' + Math.random().toString(36).substr(2, 9),
    userId,
    name: name || 'Unnamed Agent',
    status: 'Initializing',
    type: type || 'bot',
    config: config || {},
    createdAt: new Date().toISOString()
  };

  agentsDB.push(newAgent);
  res.status(201).json({ message: 'Agent deployed securely.', agent: newAgent });
};

exports.getGitHubRepos = async (req, res) => {
  const userId = req.user.id;

  try {
    const response = await githubFetchWithAutoRefresh({
      userId,
      url: 'https://api.github.com/user/repos?per_page=100',
      options: {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NexusAI-Frontend'
        }
      }
    });

    if (!response.ok) throw new Error(`API Connection Failed: ${response.status}`);
    const repos = await response.json();
    
    // Select essential repo boundaries
    const cleanRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.full_name,
      description: repo.description
    }));

    res.json({ repos: cleanRepos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Natively failed to resolve GitHub repository cluster.' });
  }
};

exports.deleteAgent = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const index = agentsDB.findIndex(a => a.id === id && a.userId === userId);
  if (index > -1) {
    agentsDB.splice(index, 1);
    res.json({ message: 'Agent decommissioned.' });
  } else {
    res.status(404).json({ error: 'Agent unit not found mapping to your ID.' });
  }
};

exports.getActivityFeed = (req, res) => {
  const userId = req.user.id;
  // Use real logs if they exist
  const userLogs = logsDB.filter(l => l.userId === userId).slice(-5).reverse();
  
  if (userLogs.length > 0) {
     const activities = userLogs.map(l => ({
        id: l.id,
        agentName: l.action === 'github-monitor' ? 'GitHub Monitor' : 'Issue Creator',
        action: l.result,
        timestamp: 'Just now',
        status: l.type === 'ERROR' ? 'error' : 'success'
     }));
     return res.json({ activities });
  }

  // Fallback if no logs yet
  res.json({ activities: [
    { id: 'base_1', agentName: 'System Kernel', action: 'Monitoring platform security', timestamp: 'Just now', status: 'success' }
  ] });
};

exports.getIntegrations = (req, res) => {
  const userId = req.user.id;
  ensureUserIntegrations(userId);
  
  // Flatten for UI: { slack: { connected: false }, github: { connected: true, username: '...' } }
  const uiIntegrations = {};
  Object.keys(integrationsDB[userId]).forEach(key => {
    uiIntegrations[key] = {
       connected: integrationsDB[userId][key].connected,
       username: integrationsDB[userId][key].username,
       email: integrationsDB[userId][key].email
    };
  });

  // System-level global fallback: If we HAVE a token in .env AND the user hasn't connected explicitly
  if (process.env.GITHUB_ACCESS_TOKEN && integrationsDB[userId].github.accessToken === null) {
      uiIntegrations.github.connected = true;
      uiIntegrations.github.username = 'System Default';
  }

  res.json({ integrations: uiIntegrations });
};

exports.linkGitHubToken = async (req, res) => {
  const userId = req.user.id;
  const { accessToken, refreshToken, expiresIn, expiresAt, refreshTokenExpiresIn } = req.body;
  
  console.log(`[Handshake] Unit ${userId} requesting GitHub platform bridge...`);

  // High-Fidelity platform bridge: automatically use the pre-configured system token
  const sanitizedToken = (accessToken === 'internal_platform_session') 
    ? process.env.GITHUB_ACCESS_TOKEN 
    : accessToken?.trim();
  const sanitizedRefreshToken = refreshToken?.trim() || null;
  const normalizedExpiresAt = expiresAt || (expiresIn ? expiresInToIso(expiresIn) : null);
  const normalizedRefreshExpiresAt = refreshTokenExpiresIn ? expiresInToIso(refreshTokenExpiresIn) : null;

  if (!sanitizedToken) {
     console.warn(`[Handshake] Bridge rejected: System-level GITHUB_ACCESS_TOKEN is null in environment context.`);
     return res.status(400).json({ error: 'GitHub Handshake Failed: System-level context is missing. Have you restarted the backend since adding the token?' });
  }

  try {
     console.log(`[Handshake] Physically validating identity cluster against GitHub API...`);
     // physically validate token against GitHub API boundaries - try standard github 'token' prefix first
     let response = await fetch('https://api.github.com/user', {
        headers: {
           'Authorization': `token ${sanitizedToken}`,
           'Accept': 'application/vnd.github.v3+json',
           'User-Agent': 'NexusAI-Platform'
        }
     });

     if (!response.ok && response.status === 401) {
        response = await fetch('https://api.github.com/user', {
           headers: {
              'Authorization': `Bearer ${sanitizedToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'NexusAI-Platform'
           }
        });
     }

     if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ 
           error: `GitHub Handshake Failure: ${errorData.message || 'Access Denied'}`,
           status: response.status 
        });
     }

     const userData = await response.json();

     if (!integrationsDB[userId]) {
        integrationsDB[userId] = { 
           slack: { connected: false }, 
          github: {
           connected: false,
           accessToken: null,
           refreshToken: null,
           expiresAt: null,
           refreshTokenExpiresAt: null,
           username: null,
           scope: null,
           tokenType: null
          },
           postgres: { connected: false },
           gmail: { connected: false }
        };
     }

     integrationsDB[userId].github.accessToken = sanitizedToken;
      integrationsDB[userId].github.refreshToken = sanitizedRefreshToken;
      integrationsDB[userId].github.expiresAt = normalizedExpiresAt;
      integrationsDB[userId].github.refreshTokenExpiresAt = normalizedRefreshExpiresAt;
     integrationsDB[userId].github.connected = true;
     integrationsDB[userId].github.username = userData.login;

     res.json({ 
        success: true, 
        message: `Successfully bridged GitHub account: ${userData.login}`,
        username: userData.login,
        expiresAt: normalizedExpiresAt
     });

  } catch (err) {
     console.error(err);
     res.status(500).json({ error: 'Failing to establish secure handshake with GitHub API sector.' });
  }
};

exports.refreshGitHubToken = async (req, res) => {
  const userId = req.user.id;
  const githubIntegration = integrationsDB[userId]?.github;

  if (!githubIntegration?.refreshToken) {
    return res.status(400).json({ error: 'No GitHub refresh token mapped for this account.' });
  }

  try {
    const refreshed = await refreshGitHubAccessToken(githubIntegration.refreshToken);
    githubIntegration.accessToken = refreshed.accessToken;
    githubIntegration.refreshToken = refreshed.refreshToken;
    githubIntegration.expiresAt = refreshed.expiresAt;
    githubIntegration.refreshTokenExpiresAt = refreshed.refreshTokenExpiresAt;
    githubIntegration.scope = refreshed.scope;
    githubIntegration.tokenType = refreshed.tokenType;
    githubIntegration.connected = true;

    res.json({
      success: true,
      message: 'GitHub token refreshed successfully.',
      expiresAt: refreshed.expiresAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to refresh GitHub access token.' });
  }
};

exports.linkGoogleToken = async (req, res) => {
  const userId = req.user.id;
  const { accessToken, refreshToken, expiresIn, expiresAt } = req.body;
  
  // High-Fidelity platform bridge: automatically use the pre-configured system token
  const sanitizedToken = accessToken?.trim();
  const sanitizedRefreshToken = refreshToken?.trim() || null;
  const normalizedExpiresAt = expiresAt || (expiresIn ? googleExpiresInToIso(expiresIn) : null);

  if (!sanitizedToken) {
     return res.status(400).json({ error: 'Google Platform Bridge failed: Environment context is missing.' });
  }

  try {
      ensureUserIntegrations(userId);

      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
       headers: {
        'Authorization': `Bearer ${sanitizedToken}`
       }
      });

     if (!response.ok) {
        const errorData = await response.json();
        const description = errorData.error_description || errorData.error?.message || errorData.error || 'Invalid Identity Token';
        return res.status(response.status).json({ 
           error: `Google Handshake Failure: ${description}`,
           status: response.status 
        });
     }

     const userData = await response.json();

     integrationsDB[userId].gmail.accessToken = sanitizedToken;
      integrationsDB[userId].gmail.refreshToken = sanitizedRefreshToken;
      integrationsDB[userId].gmail.expiresAt = normalizedExpiresAt;
     integrationsDB[userId].gmail.connected = true;
     integrationsDB[userId].gmail.email = userData.email;

     res.json({ 
        success: true, 
        message: `Successfully bridged Google Workspace: ${userData.email}`,
        email: userData.email
     });

  } catch (err) {
     console.error(err);
     res.status(500).json({ error: 'Failing to establish secure handshake with Google API sector.' });
  }
};

exports.startGoogleWorkspaceAuth = (req, res) => {
  const userId = req.user.id;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({ error: 'Google OAuth client ID is missing in environment config.' });
  }

  const stateToken = jwt.sign(
    { userId, provider: 'google' },
    JWT_SECRET,
    { expiresIn: '10m' }
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: DEFAULT_GOOGLE_REDIRECT_URI,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send'
    ].join(' '),
    state: stateToken
  });

  res.json({
    success: true,
    authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  });
};

exports.handleGoogleWorkspaceCallback = async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${DEFAULT_FRONTEND_URL}/integrations?google_status=error&message=${encodeURIComponent(String(error))}`);
  }

  if (!code || !state) {
    return res.redirect(`${DEFAULT_FRONTEND_URL}/integrations?google_status=error&message=missing_oauth_code_or_state`);
  }

  let decoded;
  try {
    decoded = jwt.verify(String(state), JWT_SECRET);
  } catch (verifyError) {
    return res.redirect(`${DEFAULT_FRONTEND_URL}/integrations?google_status=error&message=invalid_or_expired_state`);
  }

  const userId = decoded.userId;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.redirect(`${DEFAULT_FRONTEND_URL}/integrations?google_status=error&message=missing_google_client_credentials`);
  }

  try {
    const tokenBody = new URLSearchParams({
      code: String(code),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: DEFAULT_GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenBody.toString()
    });

    const tokenPayload = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenPayload.access_token) {
      const details = tokenPayload.error_description || tokenPayload.error || 'token_exchange_failed';
      return res.redirect(`${DEFAULT_FRONTEND_URL}/integrations?google_status=error&message=${encodeURIComponent(details)}`);
    }

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenPayload.access_token}`
      }
    });

    const userInfoPayload = await userInfoResponse.json();
    if (!userInfoResponse.ok) {
      const details = userInfoPayload.error_description || userInfoPayload.error || 'userinfo_lookup_failed';
      return res.redirect(`${DEFAULT_FRONTEND_URL}/integrations?google_status=error&message=${encodeURIComponent(details)}`);
    }

    ensureUserIntegrations(userId);
    integrationsDB[userId].gmail.connected = true;
    integrationsDB[userId].gmail.accessToken = tokenPayload.access_token;
    integrationsDB[userId].gmail.refreshToken = tokenPayload.refresh_token || integrationsDB[userId].gmail.refreshToken || null;
    integrationsDB[userId].gmail.expiresAt = tokenPayload.expires_in ? googleExpiresInToIso(tokenPayload.expires_in) : null;
    integrationsDB[userId].gmail.scope = tokenPayload.scope || null;
    integrationsDB[userId].gmail.tokenType = tokenPayload.token_type || 'Bearer';
    integrationsDB[userId].gmail.email = userInfoPayload.email || null;

    return res.redirect(`${DEFAULT_FRONTEND_URL}/integrations?google_status=connected&email=${encodeURIComponent(userInfoPayload.email || '')}`);
  } catch (exchangeError) {
    return res.redirect(`${DEFAULT_FRONTEND_URL}/integrations?google_status=error&message=${encodeURIComponent('oauth_exchange_crashed')}`);
  }
};

exports.refreshGoogleToken = async (req, res) => {
  const userId = req.user.id;
  ensureUserIntegrations(userId);
  const gmailIntegration = integrationsDB[userId].gmail;

  if (!gmailIntegration.refreshToken) {
    return res.status(400).json({ error: 'No Google refresh token mapped for this account.' });
  }

  try {
    const refreshed = await refreshGoogleAccessToken(gmailIntegration.refreshToken);
    gmailIntegration.accessToken = refreshed.accessToken;
    gmailIntegration.expiresAt = refreshed.expiresAt;
    gmailIntegration.scope = refreshed.scope;
    gmailIntegration.tokenType = refreshed.tokenType;
    gmailIntegration.connected = true;

    // Validate refresh result by requesting user profile once.
    const profileResponse = await googleFetchWithAutoRefresh({
      userId,
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      gmailIntegration.email = profile.email || gmailIntegration.email || null;
    }

    res.json({
      success: true,
      message: 'Google access token refreshed successfully.',
      expiresAt: refreshed.expiresAt,
      email: gmailIntegration.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to refresh Google access token.' });
  }
};

exports.toggleIntegration = (req, res) => {
  const userId = req.user.id;
  const { integrationId } = req.body;
  ensureUserIntegrations(userId);

  if (integrationId in integrationsDB[userId]) {
    integrationsDB[userId][integrationId].connected = !integrationsDB[userId][integrationId].connected;
    
    // Flatten for UI sync
    const uiIntegrations = {};
    Object.keys(integrationsDB[userId]).forEach(key => {
      uiIntegrations[key] = {
         connected: integrationsDB[userId][key].connected,
         username: integrationsDB[userId][key].username,
         email: integrationsDB[userId][key].email
      };
    });

    res.json({ success: true, integrations: uiIntegrations });
  } else {
    res.status(400).json({ error: 'Integration ID mapping not found.' });
  }
};

exports.getAgentDetails = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const agent = agentsDB.find(a => a.id === id && a.userId === userId);
  if (!agent) return res.status(404).json({ error: 'Agent unit not found.' });

  // Get REAL logs for this agent unit
  const agentLogs = logsDB.filter(l => l.agentId === id && l.userId === userId);

  const logs = agentLogs.length > 0 
    ? agentLogs.map(l => ({ timestamp: l.timestamp, message: l.result, level: l.type || 'INFO' }))
    : [
       { timestamp: new Date(Date.now() - 5000).toISOString(), message: `Initializing ${agent.name}...`, level: 'INFO' },
       { timestamp: new Date(Date.now() - 3000).toISOString(), message: 'Connected to primary SaaS cluster.', level: 'SUCCESS' },
       { timestamp: new Date(Date.now()).toISOString(), message: 'Listening for core events...', level: 'PENDING' }
    ];

  res.json({
    logs,
    config: agent.config,
    lastCommitTimestamp: agent.lastCommitTimestamp,
    lastMonitorCheckAt: agent.lastMonitorCheckAt
  });
};
