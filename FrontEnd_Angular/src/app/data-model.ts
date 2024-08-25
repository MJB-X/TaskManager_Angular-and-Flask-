
interface Subtask {
    name: string;
    done: boolean;
  }
export interface Task {
    id: number;
    title: string;
    desc: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    priority: 'Critical' | 'High' | 'Normal' | 'Low';
    startDate: Date;
    endDate: Date;
    subtasks: Subtask[];

}
