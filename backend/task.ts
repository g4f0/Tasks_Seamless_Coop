import { User } from "./user.ts"

export class Task { // Event and PersonalTasks are simply Tasks
    private static nextId: number = 0;
    private id: number;
    private checked: number; // -1 if can't be checked, 0 if not checked, 1 if checked
    private priority: number; // from 1 to 4 (1 the most, 4 the less)
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
};


