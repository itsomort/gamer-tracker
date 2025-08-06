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
  hoveredEntry: JournalEntry | null = null;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is admin and redirect to admin panel
    this.authService.isAuthenticated().subscribe(isAuth => {
      if (isAuth && this.authService.isAdmin()) {
        console.log('Admin user detected, redirecting to admin panel');
        this.router.navigate(['/admin']);
        return;
      }
    });

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
    this.http.get('/api/journal', { 
      headers,
      responseType: 'text'  // Get as text first to handle potential string responses
    }).subscribe({
      next: (response: string) => {
        this.loading = false;
        try {
          // Try to parse as JSON
          const jsonResponse = JSON.parse(response);
          if (jsonResponse.status === 0 && jsonResponse.entries) {
            // Debug: Log the raw entries to see the actual structure
            console.log('Raw entries from backend:', jsonResponse.entries);
            
            // Transform the entries array to include sentiment and formatting
            this.entries = jsonResponse.entries.map((entry: [string, string, string, number], index: number) => {
              console.log(`Entry ${index}:`, entry);
              return {
                entry: entry[1], // journal_entry is at index 1
                sentiment: entry[3], // sentiment is at index 3
                subject: entry[0], // subject is at index 0
                sessionTime: entry[2] // session_time is at index 2
              };
            });
            
            console.log('Transformed entries:', this.entries);
          } else {
            this.entries = [];
          }
        } catch (parseError) {
          // If JSON parsing fails, check if it's the "something broke!" message
          if (response.includes('something broke')) {
            this.error = '';  // Clear error to show the "no entries" message instead
            this.entries = [];
          } else {
            this.error = 'Failed to parse server response. Please try again.';
            this.entries = [];
          }
        }
      },
      error: err => {
        this.loading = false;
        console.error('Error loading entries:', err);
        
        // Handle different types of errors
        if (err.status === 500 && typeof err.error === 'string' && err.error.includes('something broke')) {
          // Backend error handler returned a string instead of JSON
          this.error = 'No journal entries found yet. Submit your first journal entry to see it here!';
        } else if (err.status === 404) {
          // User has no journal entries yet
          this.error = 'No journal entries found. Start writing your first entry!';
        } else if (err.status === 401) {
          // Authentication issue
          this.error = 'Authentication required. Please log in again.';
          this.router.navigate(['/signup']);
        } else {
          // Generic error
          this.error = 'Failed to load journal entries. Please try again.';
        }
      }
    });
  }

  getSentimentText(sentiment: number): string {
    if (sentiment >= 2) return 'Very Positive';
    if (sentiment >= 1) return 'Positive';
    if (sentiment >= 0) return 'Neutral';
    if (sentiment >= -1) return 'Negative';
    return 'Very Negative';
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

  onEntryHover(entry: JournalEntry) {
    this.hoveredEntry = entry;
  }

  onEntryLeave() {
    this.hoveredEntry = null;
  }
}
