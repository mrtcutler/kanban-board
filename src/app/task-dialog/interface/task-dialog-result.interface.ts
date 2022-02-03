import { Task } from "src/app/task/models/task.model";

export interface TaskDialogResult {
    task: Task;
    delete?: boolean;
}
