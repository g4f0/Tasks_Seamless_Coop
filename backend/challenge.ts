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
}
