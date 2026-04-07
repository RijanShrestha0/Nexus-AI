const { agentsDB, integrationsDB, logsDB } = require('../models/database');

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
  const userIntegrations = integrationsDB[userId];
  const githubToken = userIntegrations?.github?.accessToken || process.env.GITHUB_ACCESS_TOKEN;

  if (!githubToken) {
    return res.status(400).json({ error: 'GitHub Authentication missing for your account context.' });
  }

  try {
    const response = await fetch('https://api.github.com/user/repos?per_page=100', {
       headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NexusAI-Frontend'
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
  if (!integrationsDB[userId]) {
    integrationsDB[userId] = { 
       slack: { connected: false }, 
       github: { connected: !!process.env.GITHUB_ACCESS_TOKEN, accessToken: process.env.GITHUB_ACCESS_TOKEN || null },
       postgres: { connected: false },
       gmail: { connected: false }
    };
  }
  
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
  const { accessToken } = req.body;
  
  console.log(`[Handshake] Unit ${userId} requesting GitHub platform bridge...`);

  // High-Fidelity platform bridge: automatically use the pre-configured system token
  const sanitizedToken = (accessToken === 'internal_platform_session') 
    ? process.env.GITHUB_ACCESS_TOKEN 
    : accessToken?.trim();

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
           github: { connected: false, accessToken: null, username: null },
           postgres: { connected: false },
           gmail: { connected: false }
        };
     }

     integrationsDB[userId].github.accessToken = sanitizedToken;
     integrationsDB[userId].github.connected = true;
     integrationsDB[userId].github.username = userData.login;

     res.json({ 
        success: true, 
        message: `Successfully bridged GitHub account: ${userData.login}`,
        username: userData.login
     });

  } catch (err) {
     console.error(err);
     res.status(500).json({ error: 'Failing to establish secure handshake with GitHub API sector.' });
  }
};

exports.linkGoogleToken = async (req, res) => {
  const userId = req.user.id;
  const { accessToken } = req.body;
  
  // High-Fidelity platform bridge: automatically use the pre-configured system token
  const sanitizedToken = (accessToken === 'internal_platform_session') 
    ? process.env.GOOGLE_ACCESS_TOKEN || 'ya29.mock_token_success' 
    : accessToken?.trim();

  if (!sanitizedToken) {
     return res.status(400).json({ error: 'Google Platform Bridge failed: Environment context is missing.' });
  }

  try {
     // If it's a mock token, skip real API check for rapid dev experience
     if (sanitizedToken === 'ya29.mock_token_success') {
         if (!integrationsDB[userId]) {
            integrationsDB[userId] = { slack: false, github: { connected: false }, postgres: false, gmail: { connected: false } };
         }
         integrationsDB[userId].gmail = { connected: true, accessToken: sanitizedToken, email: 'user@nexus-ai.dev' };
         return res.json({ success: true, message: 'Simulated Google Cloud Handshake Successful.' });
     }

     // Physically validate token against Google API boundaries - Try Header first
     let response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
           'Authorization': `Bearer ${sanitizedToken}`
        }
     });

     if (!response.ok && response.status === 401) {
        response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${sanitizedToken}`);
     }

     if (!response.ok) {
        const errorData = await response.json();
        const description = errorData.error_description || errorData.error?.message || errorData.error || 'Invalid Identity Token';
        return res.status(response.status).json({ 
           error: `Google Handshake Failure: ${description}`,
           status: response.status 
        });
     }

     const userData = await response.json();

     if (!integrationsDB[userId]) {
        integrationsDB[userId] = { 
           slack: { connected: false }, 
           github: { connected: false, accessToken: null },
           postgres: { connected: false },
           gmail: { connected: false }
        };
     }

     integrationsDB[userId].gmail.accessToken = sanitizedToken;
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

exports.toggleIntegration = (req, res) => {
  const userId = req.user.id;
  const { integrationId } = req.body;
  
  if (!integrationsDB[userId]) {
    integrationsDB[userId] = { 
       slack: { connected: false }, 
       github: { connected: !!process.env.GITHUB_ACCESS_TOKEN, accessToken: process.env.GITHUB_ACCESS_TOKEN || null },
       postgres: { connected: false },
       gmail: { connected: false }
    };
  }

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
