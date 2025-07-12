import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'gamer-tracker';

  constructor(private router: Router) {}

  onSignupNavigate(event: Event) {
    event.preventDefault();
    console.log('Navigating to signup page');
    this.router.navigate(['/signup']);
  }
}
