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
}
