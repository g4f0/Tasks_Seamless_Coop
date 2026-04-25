const BASE = import.meta.env.VITE_P2P_BRIDGE_URL ?? "http://localhost:4312";

let ws: WebSocket | null = null;
const listeners = new Set<(groupId: string, snapshot: any) => void>();

function ensureWs() {
  if (ws) return;
  const wsUrl = BASE.replace("http://", "ws://").replace("https://", "wss://");
  ws = new WebSocket(wsUrl);

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === "group-snapshot" && msg.groupId) {
        listeners.forEach((cb) => cb(String(msg.groupId), msg.payload));
      }
    } catch {}
  };

  ws.onclose = () => {
    ws = null;
  };
}

export function onGroupSnapshot(cb: (groupId: string, snapshot: any) => void) {
  ensureWs();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function createGroupSession(groupId: string) {
  const r = await fetch(`${BASE}/p2p/group/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId }),
  });
  if (!r.ok) throw new Error("No se pudo crear sesión del grupo");
  return r.json() as Promise<{ ok: boolean; inviteCode?: string; error?: string }>;
}

export async function joinGroupSession(groupId: string, inviteCode: string) {
  const r = await fetch(`${BASE}/p2p/group/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, inviteCode }),
  });
  if (!r.ok) throw new Error("No se pudo unir al grupo P2P");
  return r.json() as Promise<{ ok: boolean; error?: string }>;
}

export async function publishGroupSnapshot(groupId: string, snapshot: unknown) {
  await fetch(`${BASE}/p2p/group/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, snapshot }),
  });
}

export async function getGroupStatus(groupId: string) {
  const r = await fetch(`${BASE}/p2p/group/status?groupId=${encodeURIComponent(groupId)}`);
  if (!r.ok) throw new Error("No se pudo obtener estado de grupo");
  return r.json() as Promise<{ ok: boolean; connected: boolean; inviteCode: string | null }>;
}
