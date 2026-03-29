let agentsDB = [];
let integrationsDB = {}; // map { userId: { slack: true, github: false, ... } }

// Seed baseline metrics math
let userBaselines = {};

exports.getMetrics = (req, res) => {
  const userId = req.user.id;
  
  // Maintain isolated context per user
  const userAgents = agentsDB.filter(a => a.userId === userId);
  
  // Create a persistent fake baseline for the user if they don't have one
  if (!userBaselines[userId]) {
    userBaselines[userId] = Math.floor(Math.random() * 50000) + 10000;
  }
  
  let baseTasks = userAgents.length > 0 ? userBaselines[userId] : 0;

  res.json({
    metrics: {
      tasksExecuted: baseTasks + (userAgents.length * 2150), 
      activeAgents: userAgents.length,
      successRate: userAgents.length > 0 ? '99.8%' : '0%',
      timeSaved: userAgents.length > 0 ? `${userAgents.length * 320}h` : '0h',
      trends: {
        tasks: userAgents.length > 0 ? '+12.5%' : '0%',
        agents: `+${userAgents.length} actively new`,
        success: userAgents.length > 0 ? '+0.1%' : '0%',
        time: userAgents.length > 0 ? '+8%' : '0%'
      }
    }
  });
};

exports.getActiveAgents = (req, res) => {
  const userAgents = agentsDB.filter(a => a.userId === req.user.id);
  res.json({ agents: userAgents });
};

exports.addAgent = (req, res) => {
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ error: 'Name highly specifically required' });

  const newAgent = {
    id: `agt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId: req.user.id, // Strictly bind to currently authenticated JWT Native User
    name,
    status: 'Running',
    type: type || 'bot'
  };

  agentsDB.push(newAgent);
  res.status(201).json({ agent: newAgent });
};

exports.deleteAgent = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  // Only physically delete the agent if it strictly belongs to the targeted user
  agentsDB = agentsDB.filter(a => !(a.id === id && a.userId === userId));
  
  res.json({ success: true, id });
};

exports.getActivityFeed = (req, res) => {
  res.json({
    activities: [
      {
        id: 'act_1',
        agentName: 'Data Sync Agent',
        action: 'completed customer cross-reference',
        timestamp: '2 mins ago',
        status: 'success'
      },
      {
        id: 'act_2',
        agentName: 'Support Agent',
        action: 'classifying new tickets',
        timestamp: 'In progress...',
        status: 'pending'
      }
    ]
  });
};

exports.getIntegrations = (req, res) => {
  const userId = req.user.id;
  
  // Default stack if no data natively found
  if (!integrationsDB[userId]) {
    integrationsDB[userId] = {
      slack: true,
      github: true,
      postgres: false,
      gmail: false
    };
  }
  
  res.json({ integrations: integrationsDB[userId] });
};

exports.toggleIntegration = (req, res) => {
  const userId = req.user.id;
  const { integrationId } = req.body;
  
  if (!integrationsDB[userId]) {
    integrationsDB[userId] = {
      slack: true,
      github: true,
      postgres: false,
      gmail: false
    };
  }
  
  if (integrationId in integrationsDB[userId]) {
    integrationsDB[userId][integrationId] = !integrationsDB[userId][integrationId];
    res.json({ success: true, integrations: integrationsDB[userId] });
  } else {
    res.status(400).json({ error: 'Integration ID mapping not found.' });
  }
};
