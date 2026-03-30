/**
 * Nexus AI - Data Storage Layer
 * Currently: In-Memory (SaaS Prototype)
 */

const usersDB = [];
const agentsDB = []; // Each agent: { id, userId, name, type, status, config, createdAt }
const logsDB = [];   // Each log: { id, agentId, userId, timestamp, action, result, type }
const integrationsDB = {}; // map { userId: { slack: { connected: false }, github: { connected: false, accessToken: null } } }
const userBaselines = {};

module.exports = {
  usersDB,
  agentsDB,
  logsDB,
  integrationsDB,
  userBaselines
};
