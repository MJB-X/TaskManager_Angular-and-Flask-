
interface Subtask {
    name: string;
    done: boolean;
  }
  
  interface Task {
    id: number;
    title: string;
    desc: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    priority: 'Critical' | 'High' | 'Normal' | 'Low';
    startDate: Date;
    endDate: Date;
    subtasks: Subtask[];
  }
export const tasksData: Task[]= [
    {
      id: 1,
      status: 'In Progress',
      title: 'Implement User Authentication',
      desc: 'Develop a secure authentication system including login, registration, and password reset features.',
      priority: 'High',
      subtasks: [
        {
          name: 'Setup User Database',
          done: true
        },
        {
          name: 'Implement Login API',
          done: false
        },
        {
          name: 'Create Registration Form',
          done: false
        }
      ],
      startDate: new Date('2024-08-20'),
      endDate: new Date('2024-08-27')
    },
    {
      id: 2,
      status: 'Pending',
      title: 'Design Landing Page',
      desc: 'Create a visually appealing and responsive landing page for the website.',
      priority: 'Normal',
      subtasks: [
        {
          name: 'Create Wireframe',
          done: true
        },
        {
          name: 'Design Hero Section',
          done: false
        },
        {
          name: 'Add Call to Action Buttons',
          done: false
        }
      ],
      startDate: new Date('2024-08-25'),
      endDate: new Date('2024-08-30')
    },
    {
      id: 3,
      status: 'Completed',
      title: 'Set Up CI/CD Pipeline',
      desc: 'Implement a continuous integration and delivery pipeline to automate testing and deployment.',
      priority: 'High',
      subtasks: [
        {
          name: 'Configure Jenkins',
          done: true
        },
        {
          name: 'Integrate with GitHub',
          done: true
        },
        {
          name: 'Automate Testing',
          done: true
        }
      ],
      startDate: new Date('2024-08-10'),
      endDate: new Date('2024-08-19')
    },
    {
      id: 4,
      status: 'In Progress',
      title: 'Develop API Documentation',
      desc: 'Create comprehensive documentation for the API, including endpoints, request/response formats, and usage examples.',
      priority: 'Normal',
      subtasks: [
        {
          name: 'Write Documentation for Endpoints',
          done: false
        },
        {
          name: 'Create Request/Response Examples',
          done: true
        },
        {
          name: 'Review and Proofread',
          done: false
        }
      ],
      startDate: new Date('2024-08-18'),
      endDate: new Date('2024-08-30')
    },
    {
      id: 5,
      status: 'Pending',
      title: 'Optimize Application Performance',
      desc: 'Identify and resolve performance bottlenecks in the application to improve overall efficiency and response time.',
      priority: 'Critical',
      subtasks: [
        {
          name: 'Profile Application Performance',
          done: false
        },
        {
          name: 'Optimize Database Queries',
          done: false
        },
        {
          name: 'Improve Caching Mechanisms',
          done: false
        }
      ],
      startDate: new Date('2024-08-21'),
      endDate: new Date('2024-08-28')
    }
  ];