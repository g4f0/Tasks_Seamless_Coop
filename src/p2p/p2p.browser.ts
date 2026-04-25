import { DataService } from "../services/DataService";

const BASE = "http://localhost:4312";
let ws: WebSocket | null = null;
let connected = false;
let listeners: Array<(c: boolean) => void> = [];
let unsubData: (() => void) | null = null;

function notify() {
  listeners.forEach((cb) => cb(connected));
}

export const isConnected = () => connected;

export const onConnectionChange = (cb: (connected: boolean) => void) => {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((x) => x !== cb);
  };
};

function ensureWs(dataService: DataService) {
  if (ws) return;
  ws = new WebSocket("ws://localhost:4312");
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === "snapshot" && msg.payload) {
        dataService.replaceStateFromSnapshot(msg.payload);
      }
      if (msg.type === "status") {
        connected = !!msg.payload?.connected;
        notify();
      }
    } catch {}
  };
  ws.onclose = () => {
    ws = null;
    connected = false;
    notify();
  };
}

export const connect = async (dataService: DataService) => {
  // por defecto: crea sesión local como creator
  await fetch(`${BASE}/p2p/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  connected = true;
  notify();

  ensureWs(dataService);

  if (unsubData) unsubData();
  unsubData = dataService.subscribe(async () => {
    if (!connected || dataService.isApplyingRemoteUpdate) return;
    const snapshot = dataService.exportSnapshot();
    await fetch(`${BASE}/p2p/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot })
    });
  });
};

export const connectAsCreator = async (dataService: DataService, storagePath?: string) => {
  const r = await fetch(`${BASE}/p2p/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storagePath })
  });
  const j = await r.json();
  connected = true;
  notify();
  ensureWs(dataService);
  return j.inviteCode as string;
};

export const connectAsInvitee = async (dataService: DataService, inviteCode: string, storagePath?: string) => {
  await fetch(`${BASE}/p2p/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inviteCode, storagePath })
  });
  connected = true;
  notify();
  ensureWs(dataService);
};

export const disconnect = async () => {
  if (unsubData) {
    unsubData();
    unsubData = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
  connected = false;
  notify();
};
