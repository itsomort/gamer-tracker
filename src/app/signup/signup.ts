import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  constructor(private router: Router) {}
  showLogin = false;
  onSignupClick(event: Event){
    event.preventDefault();
    this.showLogin = true;
  }

  onCloseModal() {
    this.showLogin = false;
    this.router.navigate(['']);
  }

  onLogin(event: Event) {
    event.preventDefault();
    // Add your login logic here
    this.showLogin = false;
    this.router.navigate(['']);
  }
}
