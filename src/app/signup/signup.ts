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
  username: string = '';
  constructor(private router: Router) {}
  onSignupClick(event: Event){
    event.preventDefault();
  }

  onCloseModal() {
    this.router.navigate(['/']);
  }

  onLogin(event: Event) {
    event.preventDefault();
    localStorage.setItem('username', this.username);
    console.log('Username set:', this.username);
    this.router.navigate(['/journal']);
  }
}
