import { promises as fs } from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const GYMS_FILE = path.join(DB_DIR, 'gyms.json');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DB_DIR, 'bookings.json');

async function ensureDir() {
  try { await fs.mkdir(DB_DIR, { recursive: true }); } catch {}
}

async function readJSON(file) {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJSON(file, data) {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ===== GYMS =====
export async function getAllGyms(filters = {}) {
  let gyms = await readJSON(GYMS_FILE);
  if (filters.city) gyms = gyms.filter(g => g.city === filters.city);
  if (filters.crowd) gyms = gyms.filter(g => g.crowdLevel === filters.crowd);
  if (filters.maxPrice) gyms = gyms.filter(g => g.pricePerHour <= Number(filters.maxPrice));
  if (filters.search) {
    const s = filters.search.toLowerCase();
    gyms = gyms.filter(g => g.name.toLowerCase().includes(s) || g.address.toLowerCase().includes(s));
  }
  return gyms.sort((a, b) => b.rating - a.rating);
}

export async function getGymById(id) {
  const gyms = await readJSON(GYMS_FILE);
  return gyms.find(g => g._id === id) || null;
}

export async function seedGyms(gymData) {
  await writeJSON(GYMS_FILE, gymData.map(g => ({ ...g, _id: genId() })));
  return readJSON(GYMS_FILE);
}

// ===== USERS =====
export async function findUserByEmail(email) {
  const users = await readJSON(USERS_FILE);
  return users.find(u => u.email === email) || null;
}

export async function createUser({ name, email, password }) {
  const users = await readJSON(USERS_FILE);
  const user = { _id: genId(), name, email, password, totalWorkouts: 0, dayStreak: 0, thisMonth: 0, createdAt: new Date().toISOString() };
  users.push(user);
  await writeJSON(USERS_FILE, users);
  return user;
}

export async function updateUser(id, updates) {
  const users = await readJSON(USERS_FILE);
  const idx = users.findIndex(u => u._id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  await writeJSON(USERS_FILE, users);
  return users[idx];
}

// ===== BOOKINGS =====
export async function getBookings(userId, status) {
  let bookings = await readJSON(BOOKINGS_FILE);
  if (userId) bookings = bookings.filter(b => b.userId === userId);
  if (status) bookings = bookings.filter(b => b.status === status);
  return bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function createBooking(data) {
  const bookings = await readJSON(BOOKINGS_FILE);
  const booking = { ...data, _id: genId(), createdAt: new Date().toISOString() };
  bookings.push(booking);
  await writeJSON(BOOKINGS_FILE, bookings);
  return booking;
}

export async function findBooking(query) {
  const bookings = await readJSON(BOOKINGS_FILE);
  return bookings.find(b => {
    return Object.keys(query).every(k => b[k] === query[k]);
  }) || null;
}
