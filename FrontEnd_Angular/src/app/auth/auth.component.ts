import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatError, MatLabel } from '@angular/material/form-field';
import { MatModule } from '../AppModules/mat/mat.module';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [MatCardModule,MatError,MatLabel,MatModule,CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  authForm: FormGroup;
  isLoginMode: boolean;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<AuthComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { isLoginMode: boolean }
  ) {
    this.isLoginMode = data.isLoginMode;
    this.authForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validator: this.passwordMatchValidator });

    if (!this.isLoginMode) {
      this.authForm.get('confirmPassword')?.setValidators([Validators.required]);
    }
  }


  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000, // Duration in milliseconds
    })}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    if (this.isLoginMode) {
      this.authForm.get('confirmPassword')?.clearValidators();
    } else {
      this.authForm.get('confirmPassword')?.setValidators([Validators.required]);
    }
    this.authForm.get('confirmPassword')?.updateValueAndValidity();
    this.error = ''; // Clear any previous errors
  }

  passwordMatchValidator(control: FormGroup): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
  
    if (confirmPassword?.value && password?.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  }

  onSubmit() {
    if (this.authForm.valid) {
      const { username, password } = this.authForm.value;
      
      if (this.isLoginMode) {
        this.authService.login(username, password).subscribe(
          success => {
            if (success) {
              this.openSnackBar('Login successful', 'Close')
              this.dialogRef.close(true); // Close dialog with success
            } else {
              this.error = 'Invalid username or password';
            }
          },
          error => {
            this.error = 'An error occurred during login. Please try again.';
          }
        );
      } else {
        // Sign-up logic
    
        this.authService.register(username, password).subscribe(
          success => {
            if (success) {
              this.openSnackBar('Registration successful', 'Close')
              this.dialogRef.close(true); // Close dialog with success
            } else {
              this.error = 'Sign-up failed. Please try again.';
            }
          },
          error => {
            this.error = 'An error occurred during sign-up. Please try again.';
          }
        );
      }
    }

  }

}
