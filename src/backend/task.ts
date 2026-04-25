import { User } from "./user"

export class Task {
    private static nextId: number = 0;
    private id: number;
    private checked: number;
    private priority: number;
    private endDate: Date;
    private name: string;
    private description: string;
    private users: User[];

    public constructor(checked: number, priority: number, name: string, 
                       description: string, endDate: Date) {
        this.id = Task.nextId++;
        this.checked = checked;
        this.priority = priority;
        this.name = name;
        this.description = description;
        this.endDate = endDate;
        this.users = [];
    }

    public get Id(): number { return this.id; }

    public get Checked(): number { return this.checked; }
    public set Checked(value: number) { this.checked = value; }

    public get Priority(): number { return this.priority; }
    public set Priority(value: number) { this.priority = value; }

    public get EndDate(): Date { return this.endDate; }
    public set EndDate(value: Date) { this.endDate = value; }

    public get Name(): string { return this.name; }
    public set Name(value: string) { this.name = value; }

    public get Description(): string { return this.description; }
    public set Description(value: string) { this.description = value; }

    public get Users(): User[] { return this.users; }
    public set Users(value: User[]) { this.users = value; }
}
