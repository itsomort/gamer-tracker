import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as CryptoJS from 'crypto-js';

function generateSalt(length: number = 5): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

function hashSHA256(data: string, salt: string): string {
  return CryptoJS.SHA256(salt + data).toString();
}


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
  salt: string = generateSalt();
  hashedUser: string = '';
  hashedPassword: string = '';
  gamesPlayed: number = 0;
  public sessionTime: number = 0; // in seconds
  public sessionTimerRunning: boolean = false;
  private sessionTimerInterval: any = null;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.subject = localStorage.getItem('subject') || '';
      this.username = localStorage.getItem('username') || '';
      this.password = localStorage.getItem('password') || '';
      this.subject = localStorage.getItem('subject') || '';
      this.journalEntry = localStorage.getItem('journalEntry') || '';
      // Hash values once after loading
      this.hashedUser = hashSHA256(this.username, this.salt);
      this.hashedPassword = hashSHA256(this.password, this.salt);
      console.log('Hashed username:', this.hashedUser); // to be removed
      console.log('Hashed password:', this.hashedPassword);
    }
  }

  constructor(private router: Router, public http: HttpClient) {}

  onHomeNavigate(event: Event) {
    event.preventDefault();
    this.router.navigate(['/']);
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
    // Use precomputed hashes
    console.log('Submitting journal entry:', { userid: this.hashedUser, password: this.hashedPassword, journal_entry: this.journalEntry });
    this.http.post<any>(
      '/api/journal',
      {
        userid: this.hashedUser,
        //password: this.hashedPassword,
        journal_entry: this.journalEntry,
        //games: this.gamesPlayed
        //time: this.sessionTime
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
