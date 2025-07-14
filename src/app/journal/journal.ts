import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-journal',
  imports: [],
  templateUrl: './journal.html',
  styleUrls: ['./journal.css']
})
export class Journal {
  constructor(private router: Router) {}

  onHomeNavigate(event: Event) {
    event.preventDefault();
    //console.log('Navigating to home page');
    this.router.navigate(['/']);
  }
}
