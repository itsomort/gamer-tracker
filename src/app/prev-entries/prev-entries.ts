import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface JournalEntry {
  entry: string;
  sentiment: number;
  subject?: string;
  sessionTime?: string;
  date?: string;
  gamesPlayed?: number;
}

@Component({
  selector: 'app-prev-entries',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './prev-entries.html',
  styleUrl: './prev-entries.css'
})
export class PrevEntries implements OnInit {
  entries: JournalEntry[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEntries();
  }

  loadEntries() {
    // Check authentication
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.username) {
      this.router.navigate(['/signup']);
      return;
    }

    // Get JWT headers for authentication middleware
    const authHeaders = this.authService.getAuthHeaders();
    const headers = { 
      'Content-Type': 'application/json',
      ...authHeaders
    };

    // Simple GET request - userid will be extracted from JWT token on backend
    this.http.get<any>('/api/journal', { headers }).subscribe({
      next: response => {
        this.loading = false;
        if (response.status === 0 && response.entries) {
          // Transform the entries array to include sentiment and formatting
          this.entries = response.entries.map((entry: [string, string, string, number]) => ({
            entry: entry[1], // journal_entry is at index 1
            sentiment: entry[3], // sentiment is at index 3
            subject: entry[0], // subject is at index 0
            sessionTime: entry[2] // session_time is at index 2
          }));
        } else {
          this.entries = [];
        }
      },
      error: err => {
        this.loading = false;
        this.error = 'Failed to load journal entries';
        console.error('Error loading entries:', err);
      }
    });
  }

  getSentimentText(sentiment: number): number {
    return sentiment;
  }

  getSentimentClass(sentiment: number): string {
    if (sentiment >= 1) return 'positive';
    if (sentiment <= -1) return 'negative';
    return 'neutral';
  }

  onHomeNavigate() {
    this.router.navigate(['/']);
  }

  onJournalNavigate() {
    this.router.navigate(['/journal']);
  }
}
