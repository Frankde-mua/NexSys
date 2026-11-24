// backend/sessions.js
// Scribe sessions (stored for 24 hours) + AI notes, for the NexSys "Session" page.
//
// Routes
//   GET    /api/sessions/:company?username=...     list this user's live sessions
//   PUT    /api/sessions/:company/:id              create / update a session (autosave)
//   DELETE /api/sessions/:company/:id?username=... delete a session
//   POST   /api/scribe/notes                       transcript -> structured notes (Anthropic API)
//
// Sessions live in each company's own database (table: sessions), like your
// calendar and expenditure data. The table is created automatically on first use.
// Expired rows are removed on every list call and by an hourly sweep.

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const SESSIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS sessions (
    id                TEXT PRIMARY KEY,
    username          VARCHAR(50) NOT NULL,
    client            JSONB,
    started_at        BIGINT NOT NULL,
    ended_at          BIGINT,
    last_activity_at  BIGINT NOT NULL,
    expires_at        BIGINT NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'recording',
    transcript        TEXT NOT NULL DEFAULT '',
    notes             TEXT NOT NULL DEFAULT '',
    invoiced          BOOLEAN NOT NULL DEFAULT FALSE
  );
  CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (username, started_at DESC);
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at);
`;

const NOTES_SYSTEM_PROMPT = `You are a scribe for a small business. You receive a raw speech-to-text transcript of a client session.
Write concise, factual notes using only what was said. Do not invent details, names, prices or diagnoses.
Use exactly these headings:
SUMMARY
KEY POINTS
SERVICES / WORK DISCUSSED
FOLLOW-UPS
If a section has nothing, write "None noted". Plain text only, no markdown symbols.`;

const toNum = (v) => (v === null || v === undefined ? null : Number(v));

const rowToSession = (r) => ({
  id: r.id,
  client: r.client || null,
  startedAt: toNum(r.started_at),
  endedAt: toNum(r.ended_at),
  lastActivityAt: toNum(r.last_activity_at),
  expiresAt: toNum(r.expires_at),
  status: r.status,
  transcript: r.transcript,
  notes: r.notes,
  invoiced: r.invoiced,
});

export function registerSessionRoutes(app, { nexsysPool, getCompanyPool }) {
  const ready = new Set(); // companies whose sessions table is known to exist

  const userBelongs = async (username, company) => {
    if (!username || !company) return false;
    const { rowCount } = await nexsysPool.query(
      `SELECT 1 FROM users WHERE username=$1 AND company_name=$2`,
      [username, company]
    );
    return rowCount > 0;
  };

  // Only called after userBelongs() has confirmed the company exists.
  const poolFor = async (company) => {
    const pool = getCompanyPool(company);
    if (!ready.has(company)) {
      await pool.query(SESSIONS_TABLE_SQL);
      ready.add(company);
    }
    return pool;
  };

  // ---- List ----
  app.get("/api/sessions/:company", async (req, res) => {
    const { company } = req.params;
    const { username } = req.query;
    try {
      if (!(await userBelongs(username, company))) {
        return res.status(403).json({ success: false, message: "Unknown user" });
      }
      const pool = await poolFor(company);
      await pool.query(`DELETE FROM sessions WHERE expires_at <= $1`, [Date.now()]);
      const { rows } = await pool.query(
        `SELECT * FROM sessions WHERE username = $1 ORDER BY started_at DESC`,
        [username]
      );
      res.json({ success: true, sessions: rows.map(rowToSession) });
    } catch (err) {
      console.error("❌ Error listing sessions:", err);
      res.status(500).json({ success: false, message: "Error listing sessions" });
    }
  });

  // ---- Create / update (autosave) ----
  app.put("/api/sessions/:company/:id", async (req, res) => {
    const { company, id } = req.params;
    const { username, session: s } = req.body || {};

    if (!s || typeof s !== "object") {
      return res.status(400).json({ success: false, message: "session is required" });
    }
    const startedAt = Number(s.startedAt);
    const lastActivityAt = Number(s.lastActivityAt ?? s.startedAt);
    const endedAt = s.endedAt == null ? null : Number(s.endedAt);
    if (
      !Number.isFinite(startedAt) ||
      !Number.isFinite(lastActivityAt) ||
      (endedAt !== null && !Number.isFinite(endedAt)) ||
      !["recording", "ended"].includes(s.status)
    ) {
      return res.status(400).json({ success: false, message: "Invalid session data" });
    }

    // Expiry is always computed here (24h after the session ended / last activity),
    // never trusted from the browser.
    const expiresAt = (endedAt ?? lastActivityAt) + SESSION_TTL_MS;

    try {
      if (!(await userBelongs(username, company))) {
        return res.status(403).json({ success: false, message: "Unknown user" });
      }
      const pool = await poolFor(company);
      const { rowCount } = await pool.query(
        `INSERT INTO sessions
           (id, username, client, started_at, ended_at, last_activity_at,
            expires_at, status, transcript, notes, invoiced)
         VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           client = EXCLUDED.client,
           ended_at = EXCLUDED.ended_at,
           last_activity_at = EXCLUDED.last_activity_at,
           expires_at = EXCLUDED.expires_at,
           status = EXCLUDED.status,
           transcript = EXCLUDED.transcript,
           notes = EXCLUDED.notes,
           invoiced = EXCLUDED.invoiced
         WHERE sessions.username = EXCLUDED.username`,
        [
          id,
          username,
          s.client ? JSON.stringify(s.client) : null,
          startedAt,
          endedAt,
          lastActivityAt,
          expiresAt,
          s.status,
          String(s.transcript ?? ""),
          String(s.notes ?? ""),
          Boolean(s.invoiced),
        ]
      );
      // rowCount 0 means the id exists but belongs to a different user.
      if (rowCount === 0) {
        return res.status(403).json({ success: false, message: "Not your session" });
      }
      res.json({ success: true, expiresAt });
    } catch (err) {
      console.error("❌ Error saving session:", err);
      res.status(500).json({ success: false, message: "Error saving session" });
    }
  });

  // ---- Delete ----
  app.delete("/api/sessions/:company/:id", async (req, res) => {
    const { company, id } = req.params;
    const { username } = req.query;
    try {
      if (!(await userBelongs(username, company))) {
        return res.status(403).json({ success: false, message: "Unknown user" });
      }
      const pool = await poolFor(company);
      await pool.query(`DELETE FROM sessions WHERE id = $1 AND username = $2`, [id, username]);
      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error deleting session:", err);
      res.status(500).json({ success: false, message: "Error deleting session" });
    }
  });

  // ---- AI notes ----
  app.post("/api/scribe/notes", async (req, res) => {
    const { transcript, clientName, username, company } = req.body || {};
    try {
      if (!(await userBelongs(username, company))) {
        return res.status(403).json({ success: false, message: "Unknown user" });
      }
      if (typeof transcript !== "string" || !transcript.trim()) {
        return res.status(400).json({ success: false, message: "transcript is required" });
      }
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(503).json({ success: false, message: "Notes service not configured" });
      }

      const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
          max_tokens: 1500,
          system: NOTES_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Client: ${clientName || "Not specified"}\n\nTranscript:\n${transcript.slice(0, 100000)}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (!apiRes.ok) {
        console.error("❌ Anthropic API error:", apiRes.status, await apiRes.text());
        return res.status(502).json({ success: false, message: "Notes service failed" });
      }

      const data = await apiRes.json();
      const notes = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      res.json({ success: true, notes });
    } catch (err) {
      console.error("❌ Error generating notes:", err);
      res.status(500).json({ success: false, message: "Error generating notes" });
    }
  });

  // ---- Hourly sweep so expired transcripts never linger in the databases ----
  const sweep = async () => {
    try {
      const { rows } = await nexsysPool.query(`SELECT company_name FROM companies`);
      for (const { company_name } of rows) {
        try {
          await getCompanyPool(company_name).query(
            `DELETE FROM sessions WHERE expires_at <= $1`,
            [Date.now()]
          );
        } catch (err) {
          // 42P01 = no sessions table yet, 3D000 = no database for this company
          if (err.code !== "42P01" && err.code !== "3D000") {
            console.error(`⚠️ Session sweep failed for ${company_name}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error("⚠️ Session sweep failed:", err.message);
    }
  };
  sweep();
  setInterval(sweep, 60 * 60 * 1000).unref();
}
