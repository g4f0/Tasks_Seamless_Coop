import { Group } from "./group"
import { FriendRequest } from "./friendRequest"

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

    public set Id(value: number) { this.id = value; }

    public static syncNextId(next: number) {
      if (next > User.nextId) User.nextId = next;
    }

    public get Name(): string { return this.name; }
    public set Name(value: string) { this.name = value; }

    public get Password(): string { return this.password; }
    public set Password(value: string) { this.password = value; }

    public get Friends(): User[] { return this.friends; }
    public set Friends(value: User[]) { this.friends = value; }

    public get Groups(): Group[] { return this.groups; }
    public set Groups(value: Group[]) { this.groups = value; }

    public get Requests(): FriendRequest[] { return this.requests; }
    public set Requests(value: FriendRequest[]) { this.requests = value; }

    public get Description(): string { return this.description; }
    public set Description(value: string) { this.description = value; }
}
