// src/helpers/sessionStore.js
// Stores scribe sessions in localStorage, per company + user, for 24 hours.

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const keyFor = (user) =>
  `nexsys_sessions:${user?.company_name || user?.company || "company"}:${
    user?.username || "user"
  }`;

// Drop anything past its expiry time.
export function purgeExpired(sessions, now = Date.now()) {
  const kept = sessions.filter((s) => s.expiresAt > now);
  return kept.length === sessions.length ? sessions : kept;
}

export function loadSessions(user) {
  try {
    const raw = JSON.parse(localStorage.getItem(keyFor(user)) || "[]");
    const now = Date.now();
    const live = purgeExpired(Array.isArray(raw) ? raw : [], now);
    // A session still marked "recording" on load was interrupted
    // (tab closed, logout, reload) - close it at its last activity.
    const normalised = live.map((s) =>
      s.status === "recording"
        ? {
            ...s,
            status: "ended",
            endedAt: s.lastActivityAt || s.startedAt,
            expiresAt: (s.lastActivityAt || s.startedAt) + SESSION_TTL_MS,
          }
        : s
    );
    return purgeExpired(normalised, now);
  } catch {
    return [];
  }
}

export function saveSessions(user, sessions) {
  try {
    localStorage.setItem(keyFor(user), JSON.stringify(sessions));
  } catch (err) {
    console.error("Could not save sessions:", err);
  }
}
