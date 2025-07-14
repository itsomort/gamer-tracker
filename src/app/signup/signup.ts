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
  constructor(private router: Router) {}
  onSignupClick(event: Event){
    event.preventDefault();
  }

  onCloseModal() {
    this.router.navigate(['/']);
  }

  onLogin(event: Event) {
    event.preventDefault();
    console.log('onLogin called');
    this.router.navigate(['/journal']);
  }
}
