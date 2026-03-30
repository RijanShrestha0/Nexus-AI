const { agentsDB, logsDB, integrationsDB } = require('../models/database');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Nexus AI Agent Execution Engine
 * Natively executes real-world actions for autonomous nodes.
 * 
 * Repo Sentinel: Monitors a LOCAL file directory and auto-commits & pushes
 *                to a specified GitHub repo every 1h45m.
 */

const COMMIT_INTERVAL = 105 * 60 * 1000; // 1 hour 45 minutes in ms

/**
 * Runs a shell command in the given directory and returns stdout.
 * Returns null on failure.
 */
function runGitCommand(cmd, cwd) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    console.error(`[Git] Command failed in ${cwd}: ${cmd}\n  → ${err.stderr?.trim() || err.message}`);
    return null;
  }
}

async function runAgent(agent) {
  const userId = agent.userId;
  const userIntegrations = integrationsDB[userId];
  const githubToken = userIntegrations?.github?.accessToken || process.env.GITHUB_ACCESS_TOKEN;

  if (!githubToken) {
    console.error(`[Agent Engine] No GitHub token mapped for user ${userId}. Skipping unit ${agent.id}.`);
    return;
  }

  try {
    const { repo, issueTitle, issueBody, localPath } = agent.config || {};
    let actionResult = null;
    let logMessage = '';

    const tokenSegment = githubToken.substring(0, 8);
    console.log(`[Agent Engine] Unit ${agent.id} executing with token [${tokenSegment}...] on ${repo || 'N/A'}`);

    // ─────────────────────────────────────────────────────────────────
    // REPO SENTINEL — Local Filesystem Monitor + Auto-Commit
    // ─────────────────────────────────────────────────────────────────
    if (agent.type === 'github-monitor') {
      if (!repo) throw new Error("Missing 'repo' (target repository) for Repo Sentinel.");
      if (!localPath) throw new Error("Missing 'localPath' (local directory) for Repo Sentinel.");

      // Validate directory exists
      if (!fs.existsSync(localPath)) {
        throw new Error(`Local directory does not exist: ${localPath}`);
      }

      const absPath = path.resolve(localPath);

      // ── Step 1: Initialize git repo if not already ──
      const gitDir = path.join(absPath, '.git');
      if (!fs.existsSync(gitDir)) {
        console.log(`[Repo Sentinel] Initializing git repo in ${absPath}...`);
        runGitCommand('git init', absPath);
        runGitCommand('git branch -M main', absPath);
      }

      // ── Step 2: Ensure remote is set to user's repo ──
      const githubUsername = userIntegrations?.github?.username || 'user';
      const remoteUrl = `https://${githubUsername}:${githubToken}@github.com/${repo}.git`;

      const existingRemote = runGitCommand('git remote get-url origin', absPath);
      if (!existingRemote) {
        runGitCommand(`git remote add origin ${remoteUrl}`, absPath);
      } else {
        // Always update remote to ensure token is fresh & repo target is correct
        runGitCommand(`git remote set-url origin ${remoteUrl}`, absPath);
      }

      // ── Step 3: Configure git user for commits ──
      const configuredEmail = runGitCommand('git config user.email', absPath);
      if (!configuredEmail) {
        runGitCommand(`git config user.email "nexus-ai@sentinel.local"`, absPath);
        runGitCommand(`git config user.name "Nexus AI Sentinel"`, absPath);
      }

      // ── Step 3b: Detect current branch name ──
      let currentBranch = runGitCommand('git rev-parse --abbrev-ref HEAD', absPath) || 'main';

      // ── Step 4: Check for uncommitted changes AND unpushed commits ──
      const statusOutput = runGitCommand('git status --porcelain', absPath);
      const hasChanges = statusOutput && statusOutput.length > 0;

      // Check for local commits that haven't been pushed yet
      let hasUnpushedCommits = false;
      const localCommitCount = runGitCommand('git rev-list --count HEAD', absPath);
      if (localCommitCount && parseInt(localCommitCount) > 0) {
        // Check if upstream is set and if we're ahead
        const unpushed = runGitCommand('git log --oneline @{u}..HEAD', absPath);
        if (unpushed === null) {
          // No upstream tracking set — all local commits are unpushed
          hasUnpushedCommits = true;
        } else if (unpushed && unpushed.length > 0) {
          hasUnpushedCommits = true;
        }
      }

      // ── Step 5: Enforce 1h45m commit interval ──
      const now = Date.now();
      const lastCommitTime = agent.lastCommitTimestamp || 0;
      const timeSinceLastCommit = now - lastCommitTime;

      // ── CASE A: Unpushed commits exist (from a previous failed push) ──
      if (hasUnpushedCommits && !hasChanges) {
        console.log(`[Repo Sentinel] Unit ${agent.id}: Found unpushed commits. Retrying push...`);

        // If there are also new uncommitted changes, stage and amend
        if (hasChanges) {
          runGitCommand('git add -A', absPath);
          runGitCommand('git commit --amend --no-edit', absPath);
        }

        // Sync and push
        if (!agent.initialSyncDone) {
          console.log(`[Repo Sentinel] First sync — fetching remote and merging histories...`);
          runGitCommand('git fetch origin', absPath);
          const remoteBranches = runGitCommand('git branch -r', absPath) || '';
          if (remoteBranches.includes('origin/main') || remoteBranches.includes('origin/master')) {
            const remoteBranch = remoteBranches.includes('origin/main') ? 'main' : 'master';
            runGitCommand(`git pull origin ${remoteBranch} --allow-unrelated-histories --no-edit`, absPath);
            currentBranch = remoteBranch;
          }
          agent.initialSyncDone = true;
        }

        let pushResult = runGitCommand(`git push -u origin ${currentBranch}`, absPath);
        if (pushResult === null) {
          console.warn(`[Repo Sentinel] Normal push failed, attempting force push...`);
          pushResult = runGitCommand(`git push -u origin ${currentBranch} --force`, absPath);
          if (pushResult === null) {
            throw new Error(`Push failed to ${repo}. Check that the repo exists and your PAT has Contents (Read/Write) access.`);
          }
        }

        agent.lastCommitTimestamp = now;
        actionResult = { status: 'push-recovered', branch: currentBranch, repo };
        logMessage = `Recovered unpushed commits — successfully pushed to ${repo}:${currentBranch}.`;
      }

      // ── CASE B: No changes and no unpushed commits — idle heartbeat ──
      else if (!hasChanges && !hasUnpushedCommits) {
        const lastLog = logsDB.filter(l => l.agentId === agent.id).reverse()[0];
        if (lastLog && (now - new Date(lastLog.timestamp).getTime() < 600000)) {
          console.log(`[Repo Sentinel] Unit ${agent.id}: No local changes detected in ${absPath}.`);
          return;
        }
        
        const minsLeft = Math.ceil((COMMIT_INTERVAL - timeSinceLastCommit) / 60000);
        let windowMsg = minsLeft > 0 ? `Next window in ${minsLeft} min` : 'Action Window Open: Awaiting file changes for immediate commit.';
        
        logMessage = `Repo Sentinel stable. Watching ${absPath} → ${repo} for local file changes. (${windowMsg})`;
        actionResult = { status: 'watching', localPath: absPath, repo };
      }

      // ── CASE C: Changes exist but interval hasn't elapsed ──
      else if (hasChanges && timeSinceLastCommit < COMMIT_INTERVAL && lastCommitTime > 0) {
        const minsRemaining = Math.ceil((COMMIT_INTERVAL - timeSinceLastCommit) / 60000);
        const lastLog = logsDB.filter(l => l.agentId === agent.id).reverse()[0];
        if (lastLog && (now - new Date(lastLog.timestamp).getTime() < 600000)) {
          return;
        }
        logMessage = `Changes detected in ${absPath}. Auto-commit scheduled in ${minsRemaining} min (1h45m cycle).`;
        actionResult = { status: 'pending', changesDetected: true, minsRemaining };
      }

      // ── CASE D: Changes exist AND commit interval elapsed — COMMIT + PUSH ──
      else if (hasChanges) {
        console.log(`[Repo Sentinel] Unit ${agent.id}: Committing changes from ${absPath} to ${repo}...`);

        // Stage all changes
        runGitCommand('git add -A', absPath);

        // Generate a smart commit message
        const changedFiles = statusOutput.split('\n').filter(l => l.trim());
        const fileCount = changedFiles.length;
        const timestamp = new Date().toLocaleString();
        const commitMsg = `nexus: auto-sync ${fileCount} file(s) — ${timestamp}`;

        // Commit
        const commitResult = runGitCommand(`git commit -m "${commitMsg}"`, absPath);
        if (!commitResult) {
          throw new Error('Git commit failed. There may be nothing to commit after staging.');
        }

        // Sync with remote before pushing (first time only)
        if (!agent.initialSyncDone) {
          console.log(`[Repo Sentinel] First sync — fetching remote and merging histories...`);
          runGitCommand('git fetch origin', absPath);
          const remoteBranches = runGitCommand('git branch -r', absPath) || '';
          if (remoteBranches.includes('origin/main') || remoteBranches.includes('origin/master')) {
            const remoteBranch = remoteBranches.includes('origin/main') ? 'main' : 'master';
            runGitCommand(`git pull origin ${remoteBranch} --allow-unrelated-histories --no-edit`, absPath);
            currentBranch = remoteBranch;
          }
          agent.initialSyncDone = true;
        }

        // Push to remote
        let pushResult = runGitCommand(`git push -u origin ${currentBranch}`, absPath);
        if (pushResult === null) {
          console.warn(`[Repo Sentinel] Normal push failed, attempting force push...`);
          pushResult = runGitCommand(`git push -u origin ${currentBranch} --force`, absPath);
          if (pushResult === null) {
            throw new Error(`Push failed to ${repo}. Check that the repo exists and your PAT has Contents (Read/Write) access.`);
          }
        }

        // Record success
        agent.lastCommitTimestamp = now;
        actionResult = { 
          status: 'committed', 
          filesChanged: fileCount, 
          commitMessage: commitMsg,
          branch: currentBranch,
          repo 
        };
        logMessage = `Auto-committed ${fileCount} file(s) to ${repo}:${currentBranch} — "${commitMsg}"`;
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // ISSUE ARCHITECT — Create GitHub Issues
    // ─────────────────────────────────────────────────────────────────
    else if (agent.type === 'issue-creator') {
      if (!repo) throw new Error("Missing 'repo' parameter for Issue Architect.");

      if (agent.lastActionTimestamp && (Date.now() - agent.lastActionTimestamp < 600000)) {
        return; 
      }

      const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: 'POST',
        headers: {
           'Authorization': `Bearer ${githubToken}`,
           'Accept': 'application/vnd.github.v3+json',
           'Content-Type': 'application/json',
           'User-Agent': 'NexusAI-Agent'
        },
        body: JSON.stringify({
           title: issueTitle || `Autonomous Issue - ${new Date().toLocaleTimeString()}`,
           body: issueBody || 'This issue was automatically generated by a Nexus AI Autonomous Agent.'
        })
      });

      if (!response.ok) throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      
      const issue = await response.json();
      agent.lastActionTimestamp = Date.now();
      actionResult = { id: issue.id, url: issue.html_url };
      logMessage = `Successfully created GitHub issue: "${issue.title}" in ${repo}.`;
    }

    // ─────────────────────────────────────────────────────────────────
    // CLOUD PROVISIONER — Create GitHub Repositories
    // ─────────────────────────────────────────────────────────────────
    else if (agent.type === 'repo-creator') {
      const { repoName, repoDesc } = agent.config || {};
      const isPrivate = agent.config.private === true;
      
      if (agent.lastActionTimestamp) return;

      const response = await fetch(`https://api.github.com/user/repos`, {
        method: 'POST',
        headers: {
           'Authorization': `Bearer ${githubToken}`,
           'Accept': 'application/vnd.github.v3+json',
           'Content-Type': 'application/json',
           'User-Agent': 'NexusAI-Agent'
        },
        body: JSON.stringify({
           name: repoName || `nexus-autonomous-${Date.now()}`,
           description: repoDesc || 'This repository was provisioned by a Nexus AI Autonomous Agent.',
           private: isPrivate,
           auto_init: true
        })
      });

      if (!response.ok) {
         const error = await response.json();
         throw new Error(`GitHub Repo Creation Failed: ${error.message || response.statusText}`);
      }
      
      const newRepo = await response.json();
      agent.lastActionTimestamp = Date.now();
      agent.status = 'Inactive'; 
      
      actionResult = { id: newRepo.id, url: newRepo.html_url, name: newRepo.full_name };
      logMessage = `Provisioned new GitHub repository: ${newRepo.full_name}. Agent unit completing lifecycle.`;
    }

    // Only log if we have something to report
    if (logMessage) {
      logsDB.push({
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        agentId: agent.id,
        userId: agent.userId,
        timestamp: new Date().toISOString(),
        action: agent.type,
        result: logMessage,
        data: actionResult
      });
      console.log(`[Agent Engine] Unit ${agent.id} execution successful: ${logMessage}`);
    }

  } catch (error) {
    const errorDetails = error.cause ? ` (${error.cause.code || error.cause.message})` : "";
    console.error(`[Agent Engine] Unit ${agent.id} terminal failure:`, error.message + errorDetails);
    logsDB.push({
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      agentId: agent.id,
      userId: agent.userId,
      timestamp: new Date().toISOString(),
      action: agent.type,
      result: `Execution failed: ${error.message}${errorDetails}`,
      type: 'ERROR'
    });
  }
}

/**
 * Autonomous Loop System
 * Orchestrates the heartbeats of all active nodes.
 */
function startAgentLoop() {
  console.log('[Agent Engine] Initializing Nexus Autonomy Loop (Interval: 30s)...');
  
  setInterval(async () => {
    const activeAgents = agentsDB.filter(a => a.status === 'Active');
    
    if (activeAgents.length === 0) return;
    
    console.log(`[Agent Engine] Core cycle processing ${activeAgents.length} active autonomous units...`);
    
    for (const agent of activeAgents) {
      await runAgent(agent);
    }
  }, 30000); // 30-second core cycle
}

module.exports = { startAgentLoop };
