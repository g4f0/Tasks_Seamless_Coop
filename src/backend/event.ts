import { Task } from "./task";

export class Event extends Task {
  public constructor(priority: number, name: string, description: string, endDate: Date) {
    super(0, priority, name, description, endDate);
  }
}
