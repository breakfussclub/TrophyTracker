import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TROPHIES_FILE = path.join(DATA_DIR, 'trophies.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJSON(filepath, defaultValue = {}) {
  if (!fs.existsSync(filepath)) {
    saveJSON(filepath, defaultValue);
    return defaultValue;
  }
  const data = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(data);
}

function saveJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

export function getUsers() {
  return loadJSON(USERS_FILE, {});
}

export function saveUsers(users) {
  saveJSON(USERS_FILE, users);
}

export function addUser(discordId, psnId = null, steamId = null) {
  const users = getUsers();
  users[discordId] = {
    psnId,
    steamId,
    addedAt: new Date().toISOString()
  };
  saveUsers(users);
}

export function getUser(discordId) {
  const users = getUsers();
  return users[discordId] || null;
}

export function getTrophyCache() {
  return loadJSON(TROPHIES_FILE, {});
}

export function saveTrophyCache(cache) {
  saveJSON(TROPHIES_FILE, cache);
}

export function updateUserTrophies(userId, platform, trophies) {
  const cache = getTrophyCache();
  if (!cache[userId]) {
    cache[userId] = {};
  }
  if (!cache[userId][platform]) {
    cache[userId][platform] = {};
  }
  cache[userId][platform] = {
    ...cache[userId][platform],
    ...trophies,
    lastChecked: new Date().toISOString()
  };
  saveTrophyCache(cache);
}

export function getUserTrophies(userId, platform) {
  const cache = getTrophyCache();
  return cache[userId]?.[platform] || {};
}
