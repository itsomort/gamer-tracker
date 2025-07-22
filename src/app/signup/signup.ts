import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
  public signupErrorMsg: string = '';
  constructor(private router: Router) {}
  onSignupClick(event: Event){
    event.preventDefault();
  }

  onCloseModal() {
    this.router.navigate(['/']);
    console.log('Signup closed, navigating to home');
  }


  // self explanatory
  onLogin(event: Event) {
    event.preventDefault();
    const errorDiv = document.getElementById('signup-error');
    if (!this.username || !this.password) {
      if (errorDiv) errorDiv.textContent = 'Username and password cannot be empty';
      console.log('Username and password cannot be empty');
      return;
    }
    if (this.username.length < 3){
      if (errorDiv) errorDiv.textContent = 'Username must be at least 3 characters long';
      console.log('Username must be at least 3 characters long');
      return;
    }
    if (this.password.length < 6){
      if (errorDiv) errorDiv.textContent = 'Password must be at least 6 characters long';
      console.log('Password must be at least 6 characters long');
      return;
    }
    else if (this.password.search(/[A-Z]/) < 0) {
      if (errorDiv) errorDiv.textContent = 'Password must contain at least one uppercase letter';
      console.log('Password must contain at least one uppercase letter');
      return;
    }
    else if (this.password.search(/[a-z]/) < 0) {
      if (errorDiv) errorDiv.textContent = 'Password must contain at least one lowercase letter';
      console.log('Password must contain at least one lowercase letter');
      return;
    }
    else if (this.password.search(/[0-9]/) < 0) {
      if (errorDiv) errorDiv.textContent = 'Password must contain at least one number';
      console.log('Password must contain at least one number');
      return;
    }
    else if (this.password.search(/[^a-zA-Z0-9]/) < 0) {
      if (errorDiv) errorDiv.textContent = 'Password must contain at least one special character';
      console.log('Password must contain at least one special character');
      return;
    }
    else if (errorDiv) errorDiv.textContent = '';
    localStorage.setItem('username', this.username);
    localStorage.setItem('password', this.password); 
    this.router.navigate(['/journal']);
  }
}
