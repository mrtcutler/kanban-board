import { Task } from "src/app/task/models/task.model";

export interface TaskDialogData {
    task: Partial<Task>;
    enableDelete: boolean;
}
