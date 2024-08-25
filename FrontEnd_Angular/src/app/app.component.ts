import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterLink, RouterOutlet ,Router} from '@angular/router';
import { MatModule } from './AppModules/mat/mat.module';
import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { MatCardModule } from '@angular/material/card';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from './auth/auth.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatModule, RouterLink, CommonModule,CustomSidenavComponent,MatCardModule],
  templateUrl: './app.component.html',
  
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Task Manager';
  collapsed = signal(false);
  isLoggedIn: boolean = false;
  isHandset = signal(false);
  sidenavOpened = signal(true);
  private destroy$ = new Subject<void>();

  sideNavWidth = computed(() => {
    if (this.isHandset()) {
      return '100%';
    }
    return this.collapsed() ? '64px' : '250px';
  });

  constructor(private breakpointObserver: BreakpointObserver ,private dialog: MatDialog ,private router: Router,private authService: AuthService) {}



  openAuthDialog(isLogin: boolean): void {
    const dialogRef = this.dialog.open(AuthComponent, {
      width: '400px',
      data: { isLoginMode: isLogin }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Auth successful');
       
        this.isLoggedIn = true;
      }
    });
  }
  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isHandset.set(result.matches);
        if (this.isHandset()) {
          this.sidenavOpened.set(false);
        } else {
          this.sidenavOpened.set(true);
        }
      });

      this.isLoggedIn=this.authService.isLoggedIn();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidenav() {
    if (this.isHandset()) {
      this.sidenavOpened.update(val => !val);
    } else {
      this.collapsed.update(val => !val);
    }
  }

  closeSidenav() {
    if (this.isHandset()) {
      this.sidenavOpened.set(false);
    }
  }

  login() {
    // Implement login logic here
    this.isLoggedIn = true;
  }
}