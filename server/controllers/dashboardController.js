exports.getMetrics = (req, res) => {
  // Simulating dynamic metrics that would normally query a database
  const executionTasks = Math.floor(Math.random() * 5000000) + 1000000;
  
  res.json({
    metrics: {
      tasksExecuted: executionTasks,
      activeAgents: 14,
      successRate: '99.8%',
      timeSaved: '1,400h',
      trends: {
        tasks: '+12.5%',
        agents: '+3 new',
        success: '+0.1%',
        time: '+8%'
      }
    }
  });
};

exports.getActiveAgents = (req, res) => {
  res.json({
    agents: [
      { id: 'agt_293', name: 'Customer Support NLP', status: 'Running normally', type: 'bot' },
      { id: 'agt_401', name: 'CRM Sync Pipeline', status: 'Running normally', type: 'database' },
      { id: 'agt_599', name: 'Log Intelligence', status: 'Idle', type: 'server' }
    ]
  });
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
