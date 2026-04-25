// @ts-ignore
import Autopass from 'autopass';

// @ts-ignore
import Corestore from 'corestore';

export class P2P {
    private atpass: Autopass;
    private crstore: Corestore;

    constructor(storagePath: string) {
        this.crstore = new Corestore(storagePath);
    }

    public async initializeAsCreator(): Promise<string> {
        this.atpass = new Autopass(this.crstore);
        await this.atpass.ready();
        return await this.atpass.createInvite();
    }

    public async initializeAsInvitee(inviteCode: string): Promise<void> {
        const pair = Autopass.pair(this.crstore, inviteCode);
        this.atpass = await pair.finished();
        await this.atpass.ready();
    }

    public async saveItem(prefix: string, id: string | number, 
                          item: any): Promise<void> {
        const key = `${prefix}:${id}`; 
        const value = JSON.stringify(item);
        
        await this.atpass.add(key, value);
    }

    public listenForUpdates(onDataReceived: (key: string, data: any) => 
                            void): void {
        this.atpass.on('update', async () => {
            for await (const { key, value } of this.atpass.list()) {
                const parsedData = JSON.parse(value.toString());
                onDataReceived(key, parsedData);
            }
        });
    }

    public async getAllItems(): Promise<Array<{key: string, data: any}>> {
        const items = [];
        for await (const { key, value } of this.atpass.list()) {
            const parsedData = JSON.parse(value.toString());
            items.push({ key, data: parsedData });
        }
        return items;
    }

    public async deleteItem(prefix: string, id: string | number): Promise<void> {
        const key = `${prefix}:${id}`;
        const tombstone = JSON.stringify({ _deleted: true });
        await this.atpass.add(key, tombstone);
    }
}
