import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Mic, Square, Trash2 } from "lucide-react";
import { CLIENTS } from "../data/clients";
import {
  SESSION_TTL_MS,
  loadSessions,
  saveSessions,
  purgeExpired,
} from "../helpers/sessionStore";

const SpeechRecognition =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const pad = (n) => String(n).padStart(2, "0");

const fmtDuration = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const fmtTime = (ts) =>
  new Date(ts).toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const hoursLeft = (s, now) =>
  Math.max(0, Math.ceil((s.expiresAt - now) / 3600000));

// Used when the AI notes endpoint is not reachable.
const basicNotes = (s) => {
  const sentences = s.transcript
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return [
    "SESSION NOTES (basic summary - AI notes service unavailable)",
    `Client: ${s.client ? `${s.client.name} ${s.client.surname}` : "Not set"}`,
    `Date: ${fmtTime(s.startedAt)}`,
    "",
    ...sentences.map((x) => `- ${x}`),
  ].join("\n");
};

export default function Session({ user, onCreateInvoice }) {
  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  const [sessions, setSessions] = useState(() => loadSessions(user));
  const [selectedId, setSelectedId] = useState(null);
  const [recordingId, setRecordingId] = useState(null);
  const [interim, setInterim] = useState("");
  const [clientId, setClientId] = useState("");
  const [rate, setRate] = useState(
    () => localStorage.getItem("nexsys_hourly_rate") || "600"
  );
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const recRef = useRef(null);
  const recordingIdRef = useRef(null);
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  // Autosave every change (also protects a long session if the user is logged out).
  useEffect(() => {
    saveSessions(user, sessions);
  }, [sessions, user]);

  // Clock for the elapsed timer.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Remove sessions older than 24 hours.
  useEffect(() => {
    const t = setInterval(() => {
      setSessions((prev) => purgeExpired(prev));
    }, 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Stop listening if the page is unmounted (e.g. logout).
  useEffect(() => {
    return () => {
      recordingIdRef.current = null;
      try {
        recRef.current?.stop();
      } catch {
        /* already stopped */
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("nexsys_hourly_rate", rate);
  }, [rate]);

  const updateSession = (id, patch) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const appendTranscript = (text) => {
    const id = recordingIdRef.current;
    if (!id) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, transcript: s.transcript + text, lastActivityAt: Date.now() }
          : s
      )
    );
  };

  const startRecognition = () => {
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-ZA";

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += piece.trim() + " ";
        else interimText += piece;
      }
      if (finalText) appendTranscript(finalText);
      setInterim(interimText);
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access was blocked. Allow it in your browser and try again.");
        stopSession();
      } else if (e.error === "network") {
        setError("Speech recognition lost its connection. The session has been ended.");
        stopSession();
      }
      // "no-speech" and "aborted" are normal - the browser restarts below.
    };

    // Browsers end continuous recognition after silence; restart while recording.
    rec.onend = () => {
      if (recordingIdRef.current) {
        try {
          rec.start();
        } catch {
          /* already starting */
        }
      }
    };

    recRef.current = rec;
    rec.start();
  };

  const startSession = () => {
    if (!SpeechRecognition || recordingIdRef.current) return;
    setError("");
    const id = String(Date.now());
    const started = Date.now();
    const client = CLIENTS.find((c) => String(c.id) === clientId) || null;
    const session = {
      id,
      client,
      startedAt: started,
      lastActivityAt: started,
      endedAt: null,
      expiresAt: started + SESSION_TTL_MS,
      status: "recording",
      transcript: "",
      notes: "",
      invoiced: false,
    };
    setSessions((prev) => [session, ...prev]);
    setSelectedId(id);
    recordingIdRef.current = id;
    setRecordingId(id);
    startRecognition();
  };

  const stopSession = () => {
    const id = recordingIdRef.current;
    recordingIdRef.current = null;
    setRecordingId(null);
    setInterim("");
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    if (id) {
      const ended = Date.now();
      updateSession(id, {
        status: "ended",
        endedAt: ended,
        expiresAt: ended + SESSION_TTL_MS,
      });
    }
    return id;
  };

  const generateNotes = async (id) => {
    const s = sessionsRef.current.find((x) => x.id === id);
    if (!s || !s.transcript.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/scribe/notes`,
        {
          transcript: s.transcript,
          clientName: s.client ? `${s.client.name} ${s.client.surname}` : "",
        },
        { timeout: 60000 }
      );
      updateSession(id, { notes: res.data.notes || basicNotes(s) });
    } catch (err) {
      console.error(err);
      updateSession(id, { notes: basicNotes(s) });
      setError("AI notes service not reachable - a basic summary was created instead.");
    } finally {
      setBusy(false);
    }
  };

  const endSession = () => {
    const id = stopSession();
    // Give the last recognised phrase a moment to land before summarising.
    if (id) setTimeout(() => generateNotes(id), 600);
  };

  const deleteSession = (id) => {
    if (id === recordingId) return;
    if (!window.confirm("Delete this session? This cannot be undone.")) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const createInvoice = (s) => {
    const end = s.endedAt || Date.now();
    const minutes = Math.max(1, Math.ceil((end - s.startedAt) / 60000));
    const price = Math.round((minutes / 60) * Number(rate) * 100) / 100;
    onCreateInvoice({
      client: s.client,
      items: [
        { name: `Consultation session (${minutes} min)`, discount: 0, price },
      ],
      sessionId: s.id,
    });
    updateSession(s.id, { invoiced: true });
  };

  const selected = sessions.find((s) => s.id === selectedId) || null;
  const isRecording = Boolean(recordingId);
  const recordingSession = sessions.find((s) => s.id === recordingId);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Session</h1>
        <p className="text-sm text-slate-600">
          Start a session and NexSys listens and writes up the notes. Sessions are
          kept for 24 hours.
        </p>
      </header>

      {!SpeechRecognition && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm p-3 rounded-lg mb-4">
          This browser does not support live speech recognition. Please use
          Chrome or Edge.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500">Client (optional)</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isRecording}
              className="w-full border rounded-lg p-2 text-sm"
            >
              <option value="">No client selected</option>
              {CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.surname}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-40">
            <label className="text-xs text-slate-500">Rate per hour (R)</label>
            <input
              type="number"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          {isRecording ? (
            <button
              onClick={endSession}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              <Square size={16} /> End session
            </button>
          ) : (
            <button
              onClick={startSession}
              disabled={!SpeechRecognition}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              <Mic size={16} /> Start session
            </button>
          )}
        </div>

        {isRecording && recordingSession && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            Listening... {fmtDuration(now - recordingSession.startedAt)}
          </div>
        )}
      </div>

      {/* Selected session */}
      {selected && (
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-semibold">
                {selected.client
                  ? `${selected.client.name} ${selected.client.surname}`
                  : "Session"}{" "}
                <span className="font-normal text-slate-500">
                  - {fmtTime(selected.startedAt)}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Duration {fmtDuration((selected.endedAt || now) - selected.startedAt)}
                {selected.invoiced && " - invoice started"}
              </p>
            </div>
            {selected.status === "ended" && (
              <div className="flex gap-2">
                <button
                  onClick={() => generateNotes(selected.id)}
                  disabled={busy || !selected.transcript.trim()}
                  className="border border-indigo-400 text-indigo-600 px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-50 disabled:opacity-50"
                >
                  {busy ? "Writing notes..." : selected.notes ? "Regenerate notes" : "Generate notes"}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => createInvoice(selected)}
                    disabled={!Number(rate) || Number(rate) <= 0}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Quick invoice
                  </button>
                )}
              </div>
            )}
          </div>

          <h3 className="text-xs font-semibold text-slate-500 mb-1">Transcript</h3>
          <div className="border rounded-lg p-3 text-sm max-h-56 overflow-y-auto whitespace-pre-wrap bg-slate-50 mb-4">
            {selected.transcript || (
              <span className="text-slate-400">
                {selected.status === "recording" ? "Waiting for speech..." : "No speech was captured."}
              </span>
            )}
            {selected.id === recordingId && interim && (
              <span className="text-slate-400 italic">{interim}</span>
            )}
          </div>

          {selected.status === "ended" && (
            <>
              <h3 className="text-xs font-semibold text-slate-500 mb-1">Notes (editable)</h3>
              <textarea
                value={selected.notes}
                onChange={(e) => updateSession(selected.id, { notes: e.target.value })}
                rows={10}
                placeholder="Notes will appear here after the session ends."
                className="w-full border rounded-lg p-3 text-sm"
              />
            </>
          )}
        </div>
      )}

      {/* Recent sessions */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Recent sessions (last 24 hours)</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No sessions yet.</p>
        ) : (
          <ul className="divide-y">
            {sessions.map((s) => (
              <li
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`flex items-center justify-between py-2 px-2 cursor-pointer rounded hover:bg-indigo-50 ${
                  s.id === selectedId ? "bg-indigo-50" : ""
                }`}
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {s.client ? `${s.client.name} ${s.client.surname}` : "No client"}
                    {s.status === "recording" && (
                      <span className="ml-2 text-xs text-red-500">recording</span>
                    )}
                    {s.invoiced && (
                      <span className="ml-2 text-xs text-green-600">invoiced</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {fmtTime(s.startedAt)} - {fmtDuration((s.endedAt || now) - s.startedAt)} -
                    deleted in ~{hoursLeft(s, now)}h
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }}
                  disabled={s.id === recordingId}
                  className="text-slate-400 hover:text-red-500 disabled:opacity-30"
                  aria-label="Delete session"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
