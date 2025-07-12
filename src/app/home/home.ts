import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  protected title = 'gamer-tracker';

  constructor(private router: Router) {}


  onSignupNavigate(event: Event) {
    event.preventDefault();
    console.log('Navigating to signup page');
    this.router.navigate(['/signup']);
  }
}
