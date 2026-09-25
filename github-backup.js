'use strict';

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'afrekening.db');

const TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = process.env.GITHUB_REPO || '';
const BRANCH = process.env.GITHUB_BACKUP_BRANCH || 'main';
const BACKUP_PATH = process.env.GITHUB_BACKUP_PATH || 'backup/afrekening.db';

const enabled = () => Boolean(TOKEN && REPO);

function apiUrl() {
  return `https://api.github.com/repos/${REPO}/contents/${BACKUP_PATH}`;
}

async function githubRequest(method, body) {
  const res = await fetch(`${apiUrl()}${method === 'GET' ? `?ref=${BRANCH}` : ''}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'de-afrekening-app',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

async function fetchExisting() {
  const res = await githubRequest('GET');
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${res.status}: ${await res.text()}`);
  return res.json();
}

async function restoreDbIfMissing() {
  if (!enabled()) {
    console.log('GitHub-backup niet geconfigureerd (GITHUB_TOKEN/GITHUB_REPO ontbreken) - start met lege databank.');
    return;
  }
  if (fs.existsSync(DB_PATH)) return;

  try {
    const existing = await fetchExisting();
    if (!existing || !existing.content) {
      console.log('Geen bestaande GitHub-backup gevonden - start met lege databank.');
      return;
    }
    const buffer = Buffer.from(existing.content, 'base64');
    fs.writeFileSync(DB_PATH, buffer);
    console.log(`Databank herstelt vanuit GitHub-backup (${buffer.length} bytes).`);
  } catch (err) {
    console.error('Kon databank niet herstellen vanuit GitHub:', err.message);
  }
}

let backupInFlight = null;

async function backupDb() {
  if (!enabled()) return;
  if (!fs.existsSync(DB_PATH)) return;

  // Voorkom overlappende backups - wacht op de lopende en start dan pas een nieuwe.
  if (backupInFlight) {
    await backupInFlight.catch(() => {});
  }
  backupInFlight = doBackup();
  try {
    await backupInFlight;
  } finally {
    backupInFlight = null;
  }
}

async function doBackup() {
  try {
    const existing = await fetchExisting();
    const content = fs.readFileSync(DB_PATH).toString('base64');

    const res = await githubRequest('PUT', {
      message: `Backup ${new Date().toISOString()}`,
      content,
      branch: BRANCH,
      ...(existing ? { sha: existing.sha } : {}),
    });

    if (!res.ok) {
      throw new Error(`GitHub PUT ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error('Backup naar GitHub mislukt:', err.message);
  }
}

module.exports = { restoreDbIfMissing, backupDb };
