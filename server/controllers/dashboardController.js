const { agentsDB, integrationsDB, userBaselines } = require('../models/database');

exports.getMetrics = (req, res) => {
  const userId = req.user.id;
  const userAgents = agentsDB.filter(a => a.userId === userId);
  
  // If no agents are active, this is a clean workspace state
  if (userAgents.length === 0) {
    return res.json({
      metrics: {
        tasksExecuted: '0',
        activeAgents: 0,
        successRate: '0.0%',
        timeSaved: '0.0h',
        trends: {
          tasks: '0%',
          agents: '0',
          success: '0%',
          time: '0%'
        }
      }
    });
  }

  if (!userBaselines[userId]) {
    userBaselines[userId] = {
      baseTasks: 25, // Start with a small "warm-up" baseline upon first deployment
      successBase: 98.4
    };
  }

  const base = userBaselines[userId];
  const totalTasks = base.baseTasks + (userAgents.length * 150);
  const timeSavedValue = (totalTasks * 0.5).toFixed(1);
  const successRateValue = (base.successBase + (userAgents.length * 0.1)).toFixed(1);

  res.json({
    metrics: {
      tasksExecuted: totalTasks.toLocaleString(),
      activeAgents: userAgents.length,
      successRate: Math.min(successRateValue, 99.9) + '%',
      timeSaved: timeSavedValue + 'h',
      trends: {
        tasks: '+12.5%',
        agents: `+${userAgents.length}`,
        success: '+0.2%',
        time: '+8.2%'
      }
    }
  });
};

exports.getActiveAgents = (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  
  // Update status based on age before returning
  const userAgents = agentsDB
    .filter(a => a.userId === userId)
    .map(agent => {
      const createdAt = new Date(agent.createdAt);
      const ageSeconds = (now - createdAt) / 1000;
      
      if (agent.status === 'Initializing' && ageSeconds > 6) {
        agent.status = 'Active';
      }
      return agent;
    });

  res.json({ agents: userAgents });
};

exports.addAgent = (req, res) => {
  const { name, type } = req.body;
  const userId = req.user.id;

  const newAgent = {
    id: 'agent_' + Math.random().toString(36).substr(2, 9),
    userId,
    name: name || 'Unnamed Agent',
    status: 'Initializing',
    type: type || 'bot',
    createdAt: new Date().toISOString()
  };

  agentsDB.push(newAgent);
  res.status(201).json({ message: 'Agent deployed securely.', agent: newAgent });
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
  const userAgents = agentsDB.filter(a => a.userId === userId);
  
  const activities = [];
  
  activities.push({
    id: 'base_1',
    agentName: 'System Kernel',
    action: 'Mapping platform security boundaries',
    timestamp: 'Just now',
    status: 'success'
  });

  userAgents.slice(0, 2).forEach((agent, i) => {
    if (i === 0) {
      activities.push({
        id: `act_deploy_${agent.id}`,
        agentName: agent.name,
        action: 'Successfully initialized core context',
        timestamp: '1 min ago',
        status: 'success'
      });
    } else {
       activities.push({
        id: `act_task_${agent.id}`,
        agentName: agent.name,
        action: 'Executing autonomous data classification',
        timestamp: 'Ongoing...',
        status: 'pending'
      });
    }
  });

  if (userAgents.length === 0) {
    activities.push({
      id: 'onboard_1',
      agentName: 'Nexus Onboard',
      action: 'Awaiting first agent deployment...',
      timestamp: 'Standby',
      status: 'pending'
    });
  }

  res.json({ activities });
};

exports.getIntegrations = (req, res) => {
  const userId = req.user.id;
  if (!integrationsDB[userId]) {
    integrationsDB[userId] = { slack: true, github: true, postgres: false, gmail: false };
  }
  res.json({ integrations: integrationsDB[userId] });
};

exports.toggleIntegration = (req, res) => {
  const userId = req.user.id;
  const { integrationId } = req.body;
  if (!integrationsDB[userId]) {
    integrationsDB[userId] = { slack: true, github: true, postgres: false, gmail: false };
  }
  if (integrationId in integrationsDB[userId]) {
    integrationsDB[userId][integrationId] = !integrationsDB[userId][integrationId];
    res.json({ success: true, integrations: integrationsDB[userId] });
  } else {
    res.status(400).json({ error: 'Integration ID mapping not found.' });
  }
};

exports.getAgentDetails = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const agent = agentsDB.find(a => a.id === id && a.userId === userId);
  if (!agent) return res.status(404).json({ error: 'Agent unit not found.' });

  const ageSeconds = (new Date() - new Date(agent.createdAt)) / 1000;
  if (agent.status === 'Initializing' && ageSeconds > 6) {
    agent.status = 'Active';
  }

  const logs = [
    { timestamp: new Date(Date.now() - 5000).toISOString(), message: `Initializing ${agent.name}...`, level: 'INFO' },
    { timestamp: new Date(Date.now() - 3000).toISOString(), message: 'Connected to primary SaaS cluster.', level: 'SUCCESS' },
    { timestamp: new Date(Date.now()).toISOString(), message: 'Awaiting autonomous task queue...', level: 'PENDING' }
  ];

  const config = { model: 'nexus-pro-v4', temperature: 0.7, region: 'us-east-1' };
  res.json({ logs, config });
};
