import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

// @ts-ignore
import Autopass from "autopass";
// @ts-ignore
import Corestore from "corestore";

const PORT = Number(process.env.P2P_PORT ?? 4312);
const SNAPSHOT_KEY = "state:snapshot";

let atpass: any | null = null;
let crstore: any | null = null;
let connected = false;
let inviteCode: string | null = null;
let latestSnapshot: any = null;

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

function broadcast(obj: unknown) {
  const data = JSON.stringify(obj);
  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) client.send(data);
  });
}

async function consumeLatestSnapshotIfAny() {
  if (!atpass) return;
  let latestRaw: string | null = null;
  for await (const { key, value } of atpass.list()) {
    if (key === SNAPSHOT_KEY) latestRaw = value.toString();
  }
  if (!latestRaw) return;
  try {
    latestSnapshot = JSON.parse(latestRaw);
    broadcast({ type: "snapshot", payload: latestSnapshot });
  } catch (e) {
    console.error("snapshot parse error", e);
  }
}

async function startCreator(storagePath = "./.p2p-store") {
  if (connected) return;
  crstore = new Corestore(storagePath);
  atpass = new Autopass(crstore);
  await atpass.ready();

  atpass.on("update", async () => {
    await consumeLatestSnapshotIfAny();
  });

  inviteCode = await atpass.createInvite();
  connected = true;
}

async function joinByInvite(code: string, storagePath = "./.p2p-store") {
  if (connected) return;
  crstore = new Corestore(storagePath);
  const pair = Autopass.pair(crstore, code);
  atpass = await pair.finished();
  await atpass.ready();

  atpass.on("update", async () => {
    await consumeLatestSnapshotIfAny();
  });

  connected = true;
  inviteCode = code;
  await consumeLatestSnapshotIfAny();
}

app.get("/health", (_, res) => {
  res.json({ ok: true, connected, inviteCode });
});

app.post("/p2p/create", async (req, res) => {
  try {
    await startCreator(req.body?.storagePath);
    res.json({ ok: true, inviteCode });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "error" });
  }
});

app.post("/p2p/join", async (req, res) => {
  try {
    const code = req.body?.inviteCode;
    if (!code) return res.status(400).json({ ok: false, error: "inviteCode required" });
    await joinByInvite(code, req.body?.storagePath);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "error" });
  }
});

app.post("/p2p/publish", async (req, res) => {
  try {
    if (!atpass) return res.status(400).json({ ok: false, error: "not connected" });
    const snapshot = req.body?.snapshot;
    if (!snapshot) return res.status(400).json({ ok: false, error: "snapshot required" });

    latestSnapshot = snapshot;
    await atpass.add(SNAPSHOT_KEY, JSON.stringify(snapshot));
    broadcast({ type: "snapshot", payload: latestSnapshot });

    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "error" });
  }
});

app.get("/p2p/latest", (_, res) => {
  res.json({ ok: true, snapshot: latestSnapshot });
});

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "status", payload: { connected, inviteCode } }));
  if (latestSnapshot) {
    ws.send(JSON.stringify({ type: "snapshot", payload: latestSnapshot }));
  }
});

httpServer.listen(PORT, () => {
  console.log(`P2P node bridge running on http://localhost:${PORT}`);
});
