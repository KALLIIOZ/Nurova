import { BASE_URL } from './config';

async function safeFetch(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function registerUser(payload) {
  const url = `${BASE_URL}/auth/register`;
  return await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  const url = `${BASE_URL}/auth/login`;
  return await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getMetrics() {
  const url = `${BASE_URL}/analytics`;
  return await safeFetch(url);
}

export async function createAppointment(payload) {
  const url = `${BASE_URL}/appointments`;
  return await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function listAppointments(user_id) {
  const url = `${BASE_URL}/appointments${user_id?`?user_id=${user_id}`:''}`;
  return await safeFetch(url);
}
