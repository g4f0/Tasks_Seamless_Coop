import { Group } from "./group.ts"
import { FriendRequest } from "./friendRequest.ts"

export class User {
    private static nextId: number = 0;
    private id: number;
    private name: string;
    private password: string;
    private friends: User[];
    private groups: Group[];
    private requests: FriendRequest[];
    private description: string;

    public constructor(name: string, password: string, description: string) {

        this.name = name;
        this.password = password;
        this.id = User.nextId++;
        this.description = description;
        this.friends = [];
        this.groups = [];
        this.requests = [];
    }
};
