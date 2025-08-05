import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  public username: string = '';
  public password: string = '';
  public email: string = '';
  public signupErrorMsg: string = '';
  public isLoading: boolean = false;
  
  constructor(private router: Router, private authService: AuthService) {}
  onSignupClick(event: Event){
    event.preventDefault();
    const errorDiv = document.getElementById('signup-error');
    
    if (!this.username || !this.password || !this.email) {
      if (errorDiv) errorDiv.textContent = 'All fields are required';
      return;
    }

    // Validate input
    if (this.username.length < 3) {
      if (errorDiv) errorDiv.textContent = 'Username must be at least 3 characters long';
      return;
    }
    
    if (this.password.length < 6) {
      if (errorDiv) errorDiv.textContent = 'Password must be at least 6 characters long';
      return;
    }

    this.isLoading = true;
    if (errorDiv) errorDiv.textContent = '';

    // Call the authentication service for registration
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.message === 'success' && response.token) {
          // Registration successful - store token and user info
          this.authService.setToken(response.token, { 
            username: this.username,
            email: this.email 
          });
          
          console.log('Registration successful! Token stored.');
          
          // Navigate to journal page
          this.router.navigate(['/journal']);
        } else {
          // Registration failed
          if (errorDiv) errorDiv.textContent = response.message || 'Registration failed';
          console.log('Registration failed:', response);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        
        if (error.status === 409) {
          if (errorDiv) errorDiv.textContent = 'Username or email already taken';
        } else if (error.status === 400) {
          if (errorDiv) errorDiv.textContent = 'Missing required fields';
        } else {
          if (errorDiv) errorDiv.textContent = 'Registration failed. Please try again.';
        }
      }
    });
  }

  onCloseModal() {
    this.router.navigate(['/']);
    console.log('Signup closed, navigating to home');
  }


  // Login with automatic registration fallback
  onLogin(event: Event) {
    event.preventDefault();
    const errorDiv = document.getElementById('signup-error');
    
    if (!this.username || !this.password) {
      if (errorDiv) errorDiv.textContent = 'Username and password cannot be empty';
      console.log('Username and password cannot be empty');
      return;
    }

    this.isLoading = true;
    if (errorDiv) errorDiv.textContent = '';

    // First, try to login
    console.log('Attempting login for:', this.username);
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.status === 0 && response.token) {
          // Login successful
          console.log('Login successful! JWT token received and stored.');
          this.authService.setToken(response.token, { 
            username: this.username,
            email: this.email 
          });
          
          // Show success message
          if (errorDiv) {
            errorDiv.style.color = '#4CAF50';
            errorDiv.textContent = 'Login successful! Redirecting...';
          }
          
          // Navigate based on user type
          setTimeout(() => {
            if (this.authService.isAdmin()) {
              console.log('Admin user detected, redirecting to admin panel');
              this.router.navigate(['/admin']);
            } else {
              console.log('Regular user, redirecting to journal');
              this.router.navigate(['/journal']);
            }
          }, 1000);
        } else {
          // Login failed - this shouldn't happen in success case
          if (errorDiv) {
            errorDiv.style.color = '#f44336';
            errorDiv.textContent = 'Login failed. Please try again.';
          }
          console.log('Login failed:', response);
        }
      },
      error: (error) => {
        console.log('Login failed, attempting registration...');
        
        // Login failed - check if it's because user doesn't exist
        if (error.status === 401) {
          // User not found or incorrect password - try registration
          console.log('User not found, attempting auto-registration');
          this.attemptAutoRegistration(errorDiv);
        } else {
          // Other error
          this.isLoading = false;
          console.error('Login error:', error);
          
          if (errorDiv) errorDiv.style.color = '#f44336';
          
          if (error.status === 400) {
            if (errorDiv) errorDiv.textContent = 'Missing required fields';
          } else {
            if (errorDiv) errorDiv.textContent = 'Login failed. Please try again.';
          }
        }
      }
    });
  }

  // Helper method to attempt auto-registration
  private attemptAutoRegistration(errorDiv: HTMLElement | null) {
    // Auto-generate email for registration
    const autoEmail = `${this.username}@auto-generated.com`;
    
    console.log('Attempting auto-registration for:', this.username);
    this.authService.register(this.username, autoEmail, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.message === 'success' && response.token) {
          // Registration successful
          this.authService.setToken(response.token, { 
            username: this.username,
            email: autoEmail 
          });
          
          console.log('Auto-registration successful! Token stored.');
          
          // Show success message
          if (errorDiv) {
            errorDiv.style.color = '#4CAF50';
            errorDiv.textContent = 'Account created successfully! Redirecting...';
          }
          
          // Navigate to journal page
          setTimeout(() => {
            this.router.navigate(['/journal']);
          }, 1000);
        } else {
          // Registration failed
          if (errorDiv) {
            errorDiv.style.color = '#f44336';
            errorDiv.textContent = response.message || 'Registration failed';
          }
          console.log('Auto-registration failed:', response);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Auto-registration error:', error);
        
        if (errorDiv) errorDiv.style.color = '#f44336';
        
        if (error.status === 409) {
          if (errorDiv) errorDiv.textContent = 'Username already taken with different password';
        } else if (error.status === 400) {
          if (errorDiv) errorDiv.textContent = 'Registration failed - missing fields';
        } else {
          if (errorDiv) errorDiv.textContent = 'Failed to create account. Please try again.';
        }
      }
    });
  }
}
