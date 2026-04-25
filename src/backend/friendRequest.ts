export class FriendRequest {
    private static nextId = 0;
    private id: number;
    private idUserSrc: number;
    private idUserDest: number;
    private accepted: boolean;
    
    public constructor(idUserSrc: number, idUserDest: number) {
        this.id = FriendRequest.nextId++;
        this.idUserSrc = idUserSrc;
        this.idUserDest = idUserDest;
        this.accepted = false;
    }

    public get Id(): number { return this.id; }

    public get IdUserSrc(): number { return this.idUserSrc; }
    public set IdUserSrc(value: number) { this.idUserSrc = value; }

    public get IdUserDest(): number { return this.idUserDest; }
    public set IdUserDest(value: number) { this.idUserDest = value; }

    public get Accepted(): boolean { return this.accepted; }
    public set Accepted(value: boolean) { this.accepted = value; }
}
