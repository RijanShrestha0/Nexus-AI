const fs = require('fs');
const path = require('path');

/**
 * Nexus AI - Data Storage Layer
 * Persistent Hub: Auto-saves to local filesystem for rapid engineering cycles.
 */

const DB_FILE = path.join(__dirname, '../nexus_data.json');

// Initialize Memory Clusters
let usersDB = [];
let agentsDB = [];
let logsDB = [];
let integrationsDB = {};
let userBaselines = {};

// Load existing state from physical storage
function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      usersDB = data.users || [];
      agentsDB = data.agents || [];
      logsDB = data.logs || [];
      integrationsDB = data.integrations || {};
      userBaselines = data.baselines || {};
      console.log('[Persistence Engine] Successfully restored platform state from physical storage.');
    }
  } catch (err) {
    console.warn('[Persistence Engine] Handshake with physical storage failed. Initializing empty cluster.', err.message);
  }
}

// Physical Backup: Flush memory clusters to disk
function saveData() {
  try {
    const data = {
      users: usersDB,
      agents: agentsDB,
      logs: logsDB,
      integrations: integrationsDB,
      baselines: userBaselines,
      lastBackup: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[Persistence Engine] Critical Failure: Unable to flush platform state to physical storage.', err.message);
  }
}

// Critical Synchronization Proxy
// This ensures any modification to the arrays/objects triggers a save.
function proxyArray(arr) {
  return new Proxy(arr, {
    set(target, property, value) {
      target[property] = value;
      saveData();
      return true;
    },
    deleteProperty(target, property) {
       const deleted = delete target[property];
       if (deleted) saveData();
       return deleted;
    }
  });
}

function proxyObject(obj) {
  return new Proxy(obj, {
    set(target, property, value) {
      target[property] = value;
      saveData();
      return true;
    },
    deleteProperty(target, property) {
       const deleted = delete target[property];
       if (deleted) saveData();
       return deleted;
    }
  });
}

// Initial Boot
loadData();

// Export the active clusters as Proxied Entities
module.exports = {
  usersDB: proxyArray(usersDB),
  agentsDB: proxyArray(agentsDB),
  logsDB: proxyArray(logsDB),
  integrationsDB: proxyObject(integrationsDB),
  userBaselines: proxyObject(userBaselines)
};
