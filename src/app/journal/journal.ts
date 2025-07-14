import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './journal.html',
  styleUrls: ['./journal.css']
})
export class Journal implements OnInit {
  subject: string = '';
  journalEntry: string = '';
  sentiment: number | null = null;
  username: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.username = localStorage.getItem('username') || '';
      this.subject = localStorage.getItem('subject') || '';
      this.journalEntry = localStorage.getItem('journalEntry') || '';
    }
  }


  onHomeNavigate(event: Event) {
    event.preventDefault();
    this.router.navigate(['/']);
  }

  onSubmit(event: Event, doSentiment: boolean) {
    // alert('onSubmit called! doSentiment=' + doSentiment + ', username=' + this.username + ', entry=' + this.journalEntry);
    event.preventDefault();
    // Hash the values (later)
    const hashedUser = this.username;
    const hashedEntry = this.journalEntry;
    console.log('Submitting journal entry:', { userid: hashedUser, journal_entry: hashedEntry });
    this.http.post<any>(
      '/api/journal',
      {
        userid: hashedUser,
        journal_entry: hashedEntry
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    ).subscribe({
      next: response => {
        if (doSentiment) this.sentiment = response.sentiment;
        else this.sentiment = this.sentiment;
        // Optionally, show a message or update the UI
        console.log('Journal entry submitted successfully:', response);
      },
      error: err => {
        console.error('Error submitting journal entry:', err);
        alert('Failed to submit journal entry. Please try again.');
      }
    });
  }
}
