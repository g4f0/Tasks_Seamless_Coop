import { Task } from "./task.ts"

class Challenge extends Task {
    private winCondition: string;
    private loseCondition: string;
    private statA: number;
    private statB: number;

    public constructor(checked: number, priority: number, name: string, 
                       description: string, endDate: Date,
                       winCondition: string, loseCondition: string,
                       statA: number, statB: number) {
        super(checked, priority, name, description, endDate);
        this.winCondition = winCondition;
        this.loseCondition = loseCondition;
        this.statA = statA;
        this.statB = statB;
    }

    public get WinCondition(): string { return this.winCondition; }
    public set WinCondition(value: string) { this.winCondition = value; }

    public get LoseCondition(): string { return this.loseCondition; }
    public set LoseCondition(value: string) { this.loseCondition = value; }

    public get StatA(): number { return this.statA; }
    public set StatA(value: number) { this.statA = value; }

    public get StatB(): number { return this.statB; }
    public set StatB(value: number) { this.statB = value; }
}
