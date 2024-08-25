import { Component, Input, input, signal, Signal } from '@angular/core';
import { MatModule } from '../AppModules/mat/mat.module';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';







export type MenuItem = { 
  title: string;
  icon: string;
  route: string};

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [MatModule,CommonModule,RouterLink,RouterModule],
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.css'
})
export class CustomSidenavComponent {

  MenuItems=signal<MenuItem[]>(
    [
      {
        title: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard'
      },
      {title:'tasks',
      icon:'assignment',
      route:'/task'},
      {title:'events',
      icon:'event',
      route:'/events'},
      {
        title: 'Logout',
        icon: 'logout',
        route: '/logout'
      }
    ]
  )

  sideNavCollapsed=signal(false)
  @Input() set collapsed(value:boolean){
    this.sideNavCollapsed.set(value)
  }



}
