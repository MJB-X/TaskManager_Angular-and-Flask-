import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import { MatModule } from '../../AppModules/mat/mat.module';
import { FormsModule, NgModel } from '@angular/forms';
import { EditModalComponent } from '../../edit-modal/edit-modal.component';
import{tasksData} from '../../db'
import { Task } from '../../data-model';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ApiService } from '../../api.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


interface Subtask {
  name: string;
  done: boolean;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule,MatModule,FormsModule,EditModalComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
  value='';
  searchValue = '';
  selectedFilter = 'all';
  displayedColumns: string[] = ['completed', 'title', 'subtasks', 'status', 'priority', 'dateRange', 'actions'];
;
  dataSource: MatTableDataSource<Task>=new MatTableDataSource<Task>();
  ifIsHandset: boolean = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dayFilter: string = 'today';
  statusFilter: string = 'all';
  
  constructor(private dialog: MatDialog,private breakpointObserver: BreakpointObserver, private taskService: ApiService, private snackBar: MatSnackBar) {

    
    this.loadTasks();
  }
  loadTasks(): void {

    this.taskService.getTasks().subscribe(
      (tasksData) => {
        console.log('Tasks data received:', tasksData);
        this.dataSource = new MatTableDataSource<Task>(tasksData);
        this.dataSource.filterPredicate = this.customFilterPredicate;
        this.dataSource.sort = this.sort;
       // Debugging line
        
      },
      (error) => {
        console.error('Error fetching tasks:', error);
      }
    );
  }

  
  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.ifIsHandset = result.matches;
        if (this.ifIsHandset) {
          this.displayedColumns = ['completed', 'title', 'status', 'actions'];
        } else {
          this.displayedColumns = ['completed', 'title', 'subtasks', 'status', 'priority', 'dateRange', 'actions'];
        }
      });
  }

  ngAfterViewInit() {
    
   
    this.dataSource.paginator = this.paginator;
    this.sort.sortChange.subscribe(() => (console.log('Sorter Trigerring')));
    this.dataSource.sortingDataAccessor = (item: Task, property: string): string | number => {
      switch(property) {
        case 'dateRange': return item.startDate.getTime(); // Convert Date to number
        case 'subtasks': return item.subtasks.length; // Sort by number of subtasks
        case 'status': return item.status;
        case 'priority': return item.priority;
        default: 
          const value = item[property as keyof Task];
          return typeof value === 'string' || typeof value === 'number' ? value : '';
      }
    };
  }

  applyFilter() {
    this.dataSource.filter = JSON.stringify({
      day: this.dayFilter,
      status: this.statusFilter,
      search: this.searchValue
    });
    this.dataSource._updateChangeSubscription(); // Add this line
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  customFilterPredicate(data: Task, filter: string): boolean {
    const filterObject = JSON.parse(filter);
    const day = filterObject.day;
    const status = filterObject.status;
    const search = filterObject.search.toLowerCase();
  
    let matchesDay = true;
    if (day !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      if (day === 'today') {
        const today = new Date();
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
      
        console.log(today);
        console.log("startDate", startDate);
        matchesDay = startDate <= today && endDate >= today;
      } else if (day === 'tomorrow') {
        const today = new Date("2024-08-24T18:30:00");
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
      
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
      
        matchesDay = startDate <= tomorrow && endDate >= tomorrow;
      }
    }
  
    let matchesStatus = true;
    if (status !== 'all') {
      matchesStatus = data.status.toLowerCase() === status.toLowerCase();
    }
  
    let matchesSearch = true;
    if (search) {
      matchesSearch = data.title.toLowerCase().includes(search) ||
                      data.desc.toLowerCase().includes(search);
    }
  
    return matchesDay && matchesStatus && matchesSearch;
  }
  
  

  openEditDialog(task: Task): void {
    const dialogRef = this.dialog.open(EditModalComponent, {
      data: {...task}  // Make sure to spread the entire task object, including the ID
    });
  
    dialogRef.afterClosed().subscribe((result: Task | undefined) => {
      if (result) {
        console.log('Dialog result:', result);  // Add this log
        this.updateTask(result);
      }
    });
  }
  
  private updateTask(updatedTask: Task): void {
    if (!updatedTask.id) {
      console.error('Task ID is missing');
      return;
    }
  
    this.taskService.updateTask(updatedTask).subscribe({
      next: (response: Task) => {
        console.log('Update response:', response);
        // Update the local data source
        const index = this.dataSource.data.findIndex(t => t.id === response.id);
        if (index !== -1) {
          this.dataSource.data[index] = response;
          this.dataSource.data = [...this.dataSource.data]; // Trigger change detection
          this.dataSource._updateChangeSubscription(); // Notify the table of the data change
        }
        this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.snackBar.open('Failed to update task', 'Close', { duration: 3000 });
      }
    });
  }
  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(EditModalComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {


        this.taskService.addTask(result).subscribe(
          (newTask) => {
            console.log('New task added:', newTask);
            this.dataSource.data = [...this.dataSource.data, newTask];
            this.dataSource._updateChangeSubscription();
            this.applyFilter();
            this.snackBar.open('Task added successfully', 'Close', { duration: 3000 });
          },
          (error) => {
            console.error('Failed to add task:', error);
            this.snackBar.open('Failed to add task', 'Close', { duration: 3000 });
          }
        );
      }
    });
}
  
  onTaskCompletionChange(task: Task, completed: boolean) {
    task.status = completed ? 'Completed' : 'In Progress';
    task.subtasks.forEach(subtask => subtask.done = completed);
    this.updateTask(task);
  }
  
  onSubtaskCompletionChange(task: Task, subtask: Subtask, completed: boolean) {
    subtask.done = completed;
    const allSubtasksDone = task.subtasks.every(sub => sub.done);
    task.status = allSubtasksDone ? 'Completed' : 'In Progress';
    this.updateTask(task);
  }
  deleteTask(task: Task) {
    // Call the delete API
    this.taskService.deleteTask(task.id).subscribe(
      () => {
        // Remove the task from the local data source after successful deletion
        const index = this.dataSource.data.indexOf(task);
        if (index > -1) {
          this.dataSource.data.splice(index, 1);
          this.dataSource._updateChangeSubscription();
        }
      },
      error => {
        console.error('Failed to delete task:', error);
      }
    );
  }

  clearSearch() {
    this.searchValue = '';
    this.applyFilter();  // Reapply the filter to reset the list to the default state
  }
  getStatusClass(status: string | undefined): string {
    if (!status) {
      return 'status-unknown'; // Or any default class you prefer
    }
  
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-unknown'; // Handle unexpected status values
    }
  }
  
  getPriorityClass(priority: string | undefined): string {
    if (!priority) {
      return 'priority-unknown'; // Or any default class you prefer
    }
  
    switch (priority.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      case 'critical':
        return 'priority-critical';
      case 'normal':
        return 'priority-normal';
      default:
        return 'priority-unknown'; // Handle unexpected priority values
    }
  }


}
