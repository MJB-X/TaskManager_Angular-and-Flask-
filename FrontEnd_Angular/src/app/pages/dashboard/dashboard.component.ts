import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { Task } from '../../data-model';
import { CommonModule } from '@angular/common';
import { MatModule } from '../../AppModules/mat/mat.module';

@Component({
  standalone: true,
  imports: [CommonModule,MatModule],

  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalTasks: number = 0;
  pendingTasks: number = 0;
  completedTasks: number = 0;
  dueTasks: { title: string, daysUntilDue: number }[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks(): void {
    this.apiService.getTasks().subscribe((tasks: Task[]) => {
      this.totalTasks = tasks.length;
      this.pendingTasks = tasks.filter(task => task.status === 'Pending').length;
      this.completedTasks = tasks.filter(task => task.status === 'Completed').length;
      
      const today = new Date();
      this.dueTasks = tasks
        .filter(task => task.status === 'Pending' && task.endDate)
        .map(task => {
          const dueDate = new Date(task.endDate);
          const timeDiff = dueDate.getTime() - today.getTime();
          const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
          return { title: task.title, daysUntilDue };
        })
        .filter(task => task.daysUntilDue >= 0)
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    });
  }
}