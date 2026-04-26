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
  ws.onclose = () => { ws = null; };
}

export function onGroupSnapshot(cb: (groupId: string, snapshot: any) => void) {
  ensureWs();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

async function parseJsonSafe(r: Response) {
  try { return await r.json(); } catch { return null; }
}

export async function createGroupSession(groupId: string) {
  const r = await fetch(`${BASE}/p2p/group/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId }),
  });
  const j = await parseJsonSafe(r);
  if (!r.ok) throw new Error(j?.error ?? "No se pudo crear sesión del grupo");
  return j as { ok: boolean; inviteCode?: string; error?: string };
}

export async function joinGroupSession(groupId: string, inviteCode: string) {
  const r = await fetch(`${BASE}/p2p/group/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, inviteCode }),
  });
  const j = await parseJsonSafe(r);
  if (!r.ok) throw new Error(j?.error ?? "No se pudo unir al grupo P2P");
  return j as { ok: boolean; error?: string };
}

export async function publishGroupSnapshot(groupId: string, snapshot: unknown) {
  try {
    const r = await fetch(`${BASE}/p2p/group/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, snapshot }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      console.warn("[publish]", j?.error ?? r.statusText);
    }
  } catch (e) {
    console.warn("[publish] network", e);
  }
}

export async function getGroupStatus(groupId: string) {
  const r = await fetch(`${BASE}/p2p/group/status?groupId=${encodeURIComponent(groupId)}`);
  const j = await parseJsonSafe(r);
  if (!r.ok) throw new Error(j?.error ?? "No se pudo obtener estado de grupo");
  return j as { ok: boolean; connected: boolean; inviteCode: string | null };
}

/**
 * Boot estable:
 * 1) status
 * 2) si hay invite local -> join
 * 3) si no, create
 * Nunca create directo sin comprobar.
 */
export async function ensureGroupConnected(groupId: string, localInviteCode: string | null) {
  const status = await getGroupStatus(groupId);

  if (status.connected) {
    return { connected: true, inviteCode: status.inviteCode ?? localInviteCode ?? "" };
  }

  if (localInviteCode) {
    await joinGroupSession(groupId, localInviteCode);
    return { connected: true, inviteCode: localInviteCode };
  }

  const created = await createGroupSession(groupId);
  return { connected: true, inviteCode: created.inviteCode ?? "" };
}

export async function getGroupLatest(groupId: string) {
  const r = await fetch(`${BASE}/p2p/group/latest?groupId=${encodeURIComponent(groupId)}`);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error ?? "No se pudo obtener latest");
  return j as { ok: boolean; snapshot: any | null };
}
