import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";

// @ts-ignore
import Autopass from "autopass";
// @ts-ignore
import Corestore from "corestore";

type GroupState = {
  corestore: any | null;
  autopass: any | null;
  connected: boolean;
  inviteCode: string | null;
  latestSnapshot: unknown | null;
};

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const HOST = process.env.P2P_HOST ?? "0.0.0.0";
const PORT = Number(process.env.P2P_PORT ?? 4312);
const BASE_STORE = process.env.P2P_STORE_BASE ?? "./.p2p-store";
const PROCESS_TAG = String(process.pid);

const groups = new Map<string, GroupState>();

function snapshotKey(groupId: string) {
  return `group:${groupId}:snapshot`;
}
function storePath(groupId: string) {
  return `${BASE_STORE}/${PROCESS_TAG}/${groupId}`;
}
function ensureGroup(groupId: string): GroupState {
  if (!groups.has(groupId)) {
    groups.set(groupId, {
      corestore: null,
      autopass: null,
      connected: false,
      inviteCode: null,
      latestSnapshot: null,
    });
  }
  return groups.get(groupId)!;
}
function broadcastGroup(groupId: string, payload: unknown) {
  const msg = JSON.stringify({ type: "group-snapshot", groupId, payload });
  wss.clients.forEach((c: any) => {
    if (c.readyState === 1) c.send(msg);
  });
}

async function consumeLatest(groupId: string) {
  const st = ensureGroup(groupId);
  if (!st.autopass) return;
  let latestRaw: string | null = null;
  for await (const { key, value } of st.autopass.list()) {
    if (key === snapshotKey(groupId)) latestRaw = value.toString();
  }
  if (!latestRaw) return;
  try {
    st.latestSnapshot = JSON.parse(latestRaw);
    broadcastGroup(groupId, st.latestSnapshot);
  } catch (e) {
    console.error(`[${groupId}] snapshot parse error`, e);
  }
}

async function createGroupSession(groupId: string) {
  const st = ensureGroup(groupId);
  if (st.connected) return st;

  st.corestore = new Corestore(storePath(groupId));
  st.autopass = new Autopass(st.corestore);
  await st.autopass.ready();

  st.autopass.on("update", async () => {
    await consumeLatest(groupId);
  });

  st.inviteCode = await st.autopass.createInvite();
  st.connected = true;
  return st;
}

async function joinGroupSession(groupId: string, inviteCode: string) {
  const st = ensureGroup(groupId);
  if (st.connected) return st;

  st.corestore = new Corestore(storePath(groupId));
  const pair = Autopass.pair(st.corestore, inviteCode);
  st.autopass = await pair.finished();
  await st.autopass.ready();

  st.autopass.on("update", async () => {
    await consumeLatest(groupId);
  });

  st.connected = true;
  st.inviteCode = inviteCode;
  await consumeLatest(groupId);
  return st;
}

app.get("/health", (_req, res) => {
  const summary = Array.from(groups.entries()).map(([groupId, st]) => ({
    groupId,
    connected: st.connected,
    inviteCode: st.inviteCode,
    hasSnapshot: !!st.latestSnapshot,
  }));
  res.json({ ok: true, groups: summary });
});

app.get("/p2p/group/status", (req, res) => {
  const groupId = String(req.query.groupId ?? "");
  if (!groupId) return res.status(400).json({ ok: false, error: "groupId required" });
  const st = ensureGroup(groupId);
  res.json({ ok: true, connected: st.connected, inviteCode: st.inviteCode });
});

app.post("/p2p/group/create", async (req, res) => {
  try {
    const groupId = String(req.body?.groupId ?? "");
    if (!groupId) return res.status(400).json({ ok: false, error: "groupId required" });
    const st = await createGroupSession(groupId);
    res.json({ ok: true, inviteCode: st.inviteCode });
  } catch (e: any) {
  console.error("CREATE ERROR", e);
  res.status(500).json({ ok: false, error: e?.message ?? "create error" });
}
});

app.post("/p2p/group/join", async (req, res) => {
  try {
    const groupId = String(req.body?.groupId ?? "");
    const inviteCode = String(req.body?.inviteCode ?? "");
    if (!groupId || !inviteCode) return res.status(400).json({ ok: false, error: "groupId + inviteCode required" });
    await joinGroupSession(groupId, inviteCode);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "join error" });
  }
});

app.post("/p2p/group/publish", async (req, res) => {
  try {
    const groupId = String(req.body?.groupId ?? "");
    const snapshot = req.body?.snapshot;
    if (!groupId || !snapshot) return res.status(400).json({ ok: false, error: "groupId + snapshot required" });

    const st = ensureGroup(groupId);
    if (!st.connected || !st.autopass) return res.status(400).json({ ok: false, error: "group not connected" });

    st.latestSnapshot = snapshot;
    await st.autopass.add(snapshotKey(groupId), JSON.stringify(snapshot));
    broadcastGroup(groupId, st.latestSnapshot);

    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "publish error" });
  }
});

app.get("/p2p/group/latest", (req, res) => {
  const groupId = String(req.query.groupId ?? "");
  if (!groupId) return res.status(400).json({ ok: false, error: "groupId required" });
  const st = ensureGroup(groupId);
  res.json({ ok: true, snapshot: st.latestSnapshot });
});

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "status", ok: true }));
});

server.listen(PORT, HOST, () => {
  console.log(`P2P bridge running on http://${HOST}:${PORT}`);
});
