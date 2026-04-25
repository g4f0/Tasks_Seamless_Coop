// @ts-ignore
import Autopass from 'autopass';
// @ts-ignore
import Corestore from 'corestore';

import { DataService } from '../services/DataService';
import { AppSnapshot } from '../services/DataService';

const SNAPSHOT_KEY = 'state:snapshot';

class P2PAutopassAdapter {
  private atpass: any | null = null;
  private crstore: any | null = null;
  private connected = false;
  private dataUnsubscribe: (() => void) | null = null;
  private connectionListeners: Array<(connected: boolean) => void> = [];

  private notifyConnection() {
    for (const cb of this.connectionListeners) cb(this.connected);
  }

  public isConnected() {
    return this.connected;
  }

  public onConnectionChange(cb: (connected: boolean) => void) {
    this.connectionListeners.push(cb);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((x) => x !== cb);
    };
  }

  public async connectAsCreator(dataService: DataService, storagePath = './.p2p-store'): Promise<string> {
    if (this.connected) throw new Error('P2P ya conectado');

    this.crstore = new Corestore(storagePath);
    this.atpass = new Autopass(this.crstore);
    await this.atpass.ready();

    await this.setupReplication(dataService);

    const invite = await this.atpass.createInvite();
    this.connected = true;
    this.notifyConnection();

    await this.publishSnapshot(dataService.exportSnapshot());

    return invite;
  }

  public async connectAsInvitee(dataService: DataService, inviteCode: string, storagePath = './.p2p-store'): Promise<void> {
    if (this.connected) throw new Error('P2P ya conectado');

    this.crstore = new Corestore(storagePath);
    const pair = Autopass.pair(this.crstore, inviteCode);
    this.atpass = await pair.finished();
    await this.atpass.ready();

    await this.setupReplication(dataService);

    this.connected = true;
    this.notifyConnection();

    await this.consumeLatestSnapshotIfAny(dataService);
  }

  private async setupReplication(dataService: DataService): Promise<void> {
    if (!this.atpass) throw new Error('Autopass no inicializado');

    this.atpass.on('update', async () => {
      await this.consumeLatestSnapshotIfAny(dataService);
    });

    // 2) Escuchar cambios locales y publicarlos
    this.dataUnsubscribe = dataService.subscribe(async () => {
      if (!this.connected || !this.atpass) return;
      if (dataService.isApplyingRemoteUpdate) return; 

      const snapshot = dataService.exportSnapshot();
      await this.publishSnapshot(snapshot);
    });
  }

  private async publishSnapshot(snapshot: AppSnapshot): Promise<void> {
    if (!this.atpass) return;
    await this.atpass.add(SNAPSHOT_KEY, JSON.stringify(snapshot));
  }

  private async consumeLatestSnapshotIfAny(dataService: DataService): Promise<void> {
    if (!this.atpass) return;

    let latestRaw: string | null = null;
    for await (const { key, value } of this.atpass.list()) {
      if (key === SNAPSHOT_KEY) {
        latestRaw = value.toString();
      }
    }

    if (!latestRaw) return;

    try {
      const snapshot = JSON.parse(latestRaw) as AppSnapshot;
      dataService.replaceStateFromSnapshot(snapshot);
    } catch (err) {
      console.error('Error parseando snapshot remoto:', err);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.dataUnsubscribe) {
      this.dataUnsubscribe();
      this.dataUnsubscribe = null;
    }

    this.atpass = null;
    this.crstore = null;
    this.connected = false;
    this.notifyConnection();
  }
}

const adapter = new P2PAutopassAdapter();

export const isConnected = () => adapter.isConnected();
export const onConnectionChange = (cb: (connected: boolean) => void) => adapter.onConnectionChange(cb);

export const connect = async (dataService: DataService) => {
  await adapter.connectAsCreator(dataService);
};

export const connectAsCreator = async (dataService: DataService, storagePath?: string) => {
  return await adapter.connectAsCreator(dataService, storagePath);
};

export const connectAsInvitee = async (dataService: DataService, inviteCode: string, storagePath?: string) => {
  await adapter.connectAsInvitee(dataService, inviteCode, storagePath);
};

export const disconnect = async () => {
  await adapter.disconnect();
};
