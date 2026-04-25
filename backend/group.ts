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
};

