import type { DataService } from "../services/DataService";

let connected = false;
const listeners: Array<(connected: boolean) => void> = [];

const notify = () => listeners.forEach((cb) => cb(connected));

export const isConnected = () => connected;

export const onConnectionChange = (cb: (connected: boolean) => void) => {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
};

export const connect = async (_dataService: DataService) => {
  // Stub navegador: no P2P nativo aquí
  connected = false;
  notify();
};

export const connectAsCreator = async (_dataService: DataService, _storagePath?: string) => {
  connected = false;
  notify();
  return "P2P no disponible en navegador";
};

export const connectAsInvitee = async (_dataService: DataService, _inviteCode: string, _storagePath?: string) => {
  connected = false;
  notify();
};

export const disconnect = async () => {
  connected = false;
  notify();
};
