import { CdkDragDrop, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { MatDialog } from "@angular/material/dialog";
import { BehaviorSubject, Observable } from "rxjs";
import { TaskDialogResult } from "./task-dialog/interface/task-dialog-result.interface";
import { TaskDialogComponent } from "./task-dialog/task-dialog.component";
import { Task } from "./task/models/task.model";

const getObservable = (collection: AngularFirestoreCollection<Task>) => {
  const subject = new BehaviorSubject<Task[]>([]);
  collection.valueChanges({ idField: 'id' }).subscribe((val: Task[]) => {
    subject.next(val);
  });
  return subject;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  public done = getObservable(this.store.collection('done')) as Observable<Task[]>;
  public inProgress = getObservable(this.store.collection('inProgress')) as Observable<Task[]>;
  public todo = getObservable(this.store.collection('todo')) as Observable<Task[]>;

  constructor(
    private dialog: MatDialog,
    private store: AngularFirestore
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
        if (!result || (!!result && !result.task?.title)) {
          return;
        }
        this.store.collection('todo').add(result.task);
      })
  }

  public editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed()
      .subscribe((result: TaskDialogResult|undefined) => {
        if (!result) {
          return;
        }
        if (result.delete) {
          this.store.collection(list).doc(task.id).delete();
        } else {
          this.store.collection(list).doc(task.id).update(task);
        }
      });
  }

  public drop(event: CdkDragDrop<Task[]> | any): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container?.data || !event.previousContainer?.data) {
      return;
    }

    const item = event.previousContainer.data[event.previousIndex];
    this.store.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.store.collection(event.previousContainer.id).doc(item.id).delete(),
        this.store.collection(event.container.id).add(item)
      ]);
      return promise;
    });

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
