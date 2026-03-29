/**
 * Nexus AI - Data Storage Layer
 * Currently: In-Memory (SaaS Prototype)
 * Mapped for future: PostgreSQL (Prisma) / MongoDB (Mongoose)
 */

const usersDB = [];
const agentsDB = [];
const integrationsDB = {}; // format: { userId: { slack: true, github: true } }
const userBaselines = {};

module.exports = {
  usersDB,
  agentsDB,
  integrationsDB,
  userBaselines
};
