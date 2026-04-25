import { Task } from "./task.ts"
import { User } from "./user.ts"

export class Group {
    private static nextId: number = 0;
    private id: number;
    private name: string;
    private users: User[];
    private tasks: Task[];
    private description: string;

    public constructor(name: string, description: string) {
        this.id = Group.nextId++;
        this.name = name;
        this.description = description;
        this.tasks = [];
        this.users = [];
    }

    public get Id(): number { return this.id; }

    public get Name(): string { return this.name; }
    public set Name(value: string) { this.name = value; }

    public get Users(): User[] { return this.users; }
    public set Users(value: User[]) { this.users = value; }

    public get Tasks(): Task[] { return this.tasks; }
    public set Tasks(value: Task[]) { this.tasks = value; }

    public get Description(): string { return this.description; }
    public set Description(value: string) { this.description = value; }
}
