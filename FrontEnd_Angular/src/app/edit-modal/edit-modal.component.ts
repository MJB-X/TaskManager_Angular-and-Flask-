import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatModule } from '../AppModules/mat/mat.module';
import{Task}from '../data-model'
import { CommonModule } from '@angular/common';


interface Subtask {
  name: string;
  done: boolean;
}

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [MatModule,CommonModule],
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.css']
})
export class EditModalComponent {
  taskForm: FormGroup;
  isEditing: boolean;

  constructor(
    public dialogRef: MatDialogRef<EditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task | null,
    private fb: FormBuilder
  ) {
    this.isEditing = !!data;

    this.taskForm = this.fb.group({
      title: [data?.title || '', Validators.required],
      desc: [data?.desc || ''],
      status: [data?.status || 'Pending', Validators.required],
      priority: [data?.priority || 'Normal', Validators.required],
      startDate: [data?.startDate || null],
      endDate: [data?.endDate || null],
      subtasks: this.fb.array(
        (data?.subtasks || []).map((subtask: Subtask) => this.fb.group({
          name: [subtask.name, Validators.required],
          done: [subtask.done]
        }))
      )
    });
  }

  get subtasks(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  addSubtask(): void {
    this.subtasks.push(this.fb.group({
      name: ['', Validators.required],
      done: [false]
    }));
  }

  removeSubtask(index: number): void {
    this.subtasks.removeAt(index);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const updatedTask = {
        ...this.data, // Spread the original task data (including the ID)
        ...this.taskForm.value // Overwrite with new form values
      };
      console.log('Submitting updated task:', updatedTask); // For debugging
      this.dialogRef.close(updatedTask);
    }
  }
  }

