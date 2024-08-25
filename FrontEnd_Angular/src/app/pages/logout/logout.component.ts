import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatModule } from '../../AppModules/mat/mat.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [MatModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent {

  constructor(private authService: AuthService, private router: Router) { }

  confirmLogout(): void {


    this.authService.logout();
    window.location.reload();
    
  }

}
