import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { EventsComponent } from './pages/events/events.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { AppComponent } from './app.component';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },



    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path:'task',
        component:TasksComponent
    },{
        path:'events',
        component:EventsComponent
    },{
        path:'logout',
        component:LogoutComponent
    }
  
];
