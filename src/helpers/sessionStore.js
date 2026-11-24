// src/helpers/sessionStore.js
// Talks to the NexSys API. Sessions are stored server-side (in the company's
// database) and expire 24 hours after they end.
import axios from "axios";

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const companyOf = (user) => user?.company_name || user?.company || "";

const base = (user) =>
  `${import.meta.env.VITE_API_URL}/api/sessions/${encodeURIComponent(companyOf(user))}`;

// Drop anything past its expiry time (the server also does this).
export function purgeExpired(sessions, now = Date.now()) {
  const kept = sessions.filter((s) => s.expiresAt > now);
  return kept.length === sessions.length ? sessions : kept;
}

export async function fetchSessions(user) {
  const res = await axios.get(base(user), { params: { username: user.username } });
  return purgeExpired(res.data.sessions || []);
}

export async function saveSession(user, session) {
  await axios.put(`${base(user)}/${encodeURIComponent(session.id)}`, {
    username: user.username,
    session,
  });
}

export async function removeSession(user, id) {
  await axios.delete(`${base(user)}/${encodeURIComponent(id)}`, {
    params: { username: user.username },
  });
}
