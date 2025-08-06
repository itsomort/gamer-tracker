import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';


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
  password: string = '';
  gamesPlayed: number = 0;
  public sessionTime: number = 0; // in seconds
  public sessionTimerRunning: boolean = false;
  private sessionTimerInterval: any = null;

  ngOnInit() {
    // Check if user is admin and redirect to admin panel
    this.authService.isAuthenticated().subscribe(isAuth => {
      if (isAuth && this.authService.isAdmin()) {
        console.log('Admin user detected, redirecting to admin panel');
        this.router.navigate(['/admin']);
        return;
      }
    });

    if (typeof window !== 'undefined') {
      this.subject = localStorage.getItem('subject') || '';
      this.username = localStorage.getItem('username') || '';
      this.password = localStorage.getItem('password') || '';
      this.journalEntry = localStorage.getItem('journalEntry') || '';
    }
  }

    constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  onHomeNavigate(event: Event) {
    event.preventDefault();
    this.router.navigate(['/prev-entries']);
  }


  incrementGames() {
    this.gamesPlayed++;
  }

  decrementGames() {
    if (this.gamesPlayed > 0) this.gamesPlayed--;
  }

  get sessionTimeDisplay(): string {
    const min = Math.floor(this.sessionTime / 60).toString().padStart(2, '0');
    const sec = (this.sessionTime % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  toggleSessionTimer() {
    if (this.sessionTimerRunning) {
      clearInterval(this.sessionTimerInterval);
      this.sessionTimerRunning = false;
    } else {
      this.sessionTimerInterval = setInterval(() => {
        this.sessionTime++;
      }, 1000);
      this.sessionTimerRunning = true;
    }
  }

  clearSessionTime() {
    this.sessionTime = 0;
    if (this.sessionTimerRunning) {
      clearInterval(this.sessionTimerInterval);
      this.sessionTimerRunning = false;
    }
  }

  

  onSubmit(event: Event, doSentiment: boolean) {
    event.preventDefault();
    
    // Get current user from AuthService
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.username) {
      alert('Authentication required. Please log in again.');
      this.router.navigate(['/signup']);
      return;
    }
    
    // Get JWT headers for authentication middleware
    const authHeaders = this.authService.getAuthHeaders();
    const headers = { 
      'Content-Type': 'application/json',
      ...authHeaders
    };
    
    // Send request with new API format (subject, journal_entry, session_time)
    this.http.post<any>(
      '/api/journal',
      {
        subject: this.subject,
        journal_entry: this.journalEntry,
        session_time: this.sessionTimeDisplay
      },
      { headers }
    ).subscribe({
      next: response => {
        if (doSentiment) this.sentiment = response.sentiment;
        else this.sentiment = this.sentiment;
        // Show AI advice if available
        if (response.advice) {
          console.log('AI Advice:', response.advice);
        }
        console.log('Journal entry submitted successfully:', response);
      },
      error: err => {
        console.error('Error submitting journal entry:', err);
        alert('Failed to submit journal entry. Please try again.');
      }
    });
  }
}
