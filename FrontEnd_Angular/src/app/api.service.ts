import { Injectable } from '@angular/core';
import { tasksData } from './db';
import{Task} from './data-model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = "http://127.0.0.1:5000"

  constructor(private http: HttpClient) {}

  // Get all tasks
  getTasks(): Observable<Task[]> {
    console.log('Fetch called')
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }
  addTask(task: Task): Observable<Task> {
    console.log('Add called')
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }
  // Update a task
  //as we don't have id in Db please update Db with id
  updateTask(task: Task): Observable<Task> {
    console.log('Update called',task);
    return this.http.put<Task>(`${this.apiUrl}/tasks/${task.id}`, task);
  }

  // Delete a task by ID
  //same for this aswell
  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
  }
  
}
