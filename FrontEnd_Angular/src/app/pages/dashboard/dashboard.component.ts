import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { Task } from '../../data-model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalTasks: number = 0;
  pendingTasks: number = 0;
  completedTasks: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks(): void {
    this.apiService.getTasks().subscribe((tasks: Task[]) => {
      this.totalTasks = tasks.length;
      this.pendingTasks = tasks.filter(task => task.status === 'Pending').length;
      this.completedTasks = tasks.filter(task => task.status === 'Completed').length;
    });
  }
}
