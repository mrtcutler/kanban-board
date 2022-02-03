import { CdkDragDrop, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { TaskDialogResult } from "./task-dialog/interface/task-dialog-result.interface";
import { TaskDialogComponent } from "./task-dialog/task-dialog.component";
import { Task } from "./task/models/task.model";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  public inProgress: Task[] = [];
  public done: Task[] = [];
  public todo: Task[] = [
    {
      title: "Buy Milk",
      description: "Go to the store and buy milk",
    },
    {
      title: "Create Kanban App",
      description: "Using Firebase and Angular to create a Kanban App!",
    }
  ];

  constructor(
    private dialog: MatDialog
  ) {
    this.dialog = dialog;
  }

  public newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult) => {
        if (!result) {
          return;
        }
        this.todo.push(result.task);
      })
  }

  public editTask(list: string, task: Task): void {

  }

  public drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container?.data || !event.previousContainer?.data) {
      return;
    }
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
