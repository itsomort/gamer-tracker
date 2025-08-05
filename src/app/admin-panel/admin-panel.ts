import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-panel',
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit {
  users: any[] = [];
  selectedUser: any = null;
  journals: any[] = [];
  selectedJournal: any = null;

  constructor(
    private router: Router, 
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if user is authenticated and is admin
    if (!this.authService.hasToken()) {
      this.router.navigate(['/signup']);
      return;
    }

    if (!this.authService.isAdmin()) {
      console.log('Access denied: User is not admin');
      this.router.navigate(['/']);
      return;
    }

    this.loadUsers();
  }

  loadUsers() {
    // Load all users from the system
    console.log('Loading users...');
    
    const authHeaders = this.authService.getAuthHeaders();
    const headers = { 
      'Content-Type': 'application/json',
      ...authHeaders
    };
    
    this.http.get<any>('/api/admin/users', { headers }).subscribe({
      next: response => {
        if (response.status === 0) {
          this.users = response.users;
          console.log('Loaded users:', this.users);
        } else {
          console.error('Failed to load users:', response.message);
        }
      },
      error: err => {
        console.error('Error loading users:', err);
        if (err.status === 403) {
          console.log('Access denied - not admin');
          this.router.navigate(['/']);
        }
      }
    });
  }

  onUserSelect(user: any) {
    this.selectedUser = user;
    this.loadUserJournals(user.username);
  }

  loadUserJournals(username: string) {
    console.log('Loading journals for user:', username);
    
    const authHeaders = this.authService.getAuthHeaders();
    const headers = { 
      'Content-Type': 'application/json',
      ...authHeaders
    };
    
    this.http.get<any>(`/api/admin/journals/${username}`, { headers }).subscribe({
      next: response => {
        if (response.status === 0) {
          this.journals = response.journals.map((journal: any) => ({
            ...journal,
            id: journal._id,
            subject: journal.subject || 'No Subject',
            content: journal.journal_entry,
            games: journal.games || 0,
            time: journal.time || 0,
            date: new Date(journal.date)
          }));
          console.log('Loaded journals:', this.journals);
        } else {
          console.error('Failed to load journals:', response.message);
          this.journals = [];
        }
      },
      error: err => {
        console.error('Error loading journals:', err);
        this.journals = [];
      }
    });
  }

  onJournalSelect(journal: any) {
    this.selectedJournal = journal;
  }

  deleteUser() {
    if (!this.selectedUser) return;
    
    if (confirm(`Are you sure you want to delete user: ${this.selectedUser.username}?`)) {
      console.log('Deleting user:', this.selectedUser.username);
      
      const authHeaders = this.authService.getAuthHeaders();
      const headers = { 
        'Content-Type': 'application/json',
        ...authHeaders
      };
      
      this.http.delete<any>(`/api/admin/user/${this.selectedUser.username}`, { headers }).subscribe({
        next: response => {
          if (response.status === 0) {
            console.log('User deleted successfully');
            // Remove user from local array
            this.users = this.users.filter(user => user.username !== this.selectedUser.username);
            // Clear selections
            this.selectedUser = null;
            this.selectedJournal = null;
            this.journals = [];
          } else {
            console.error('Failed to delete user:', response.message);
            alert('Failed to delete user: ' + response.message);
          }
        },
        error: err => {
          console.error('Error deleting user:', err);
          alert('Error deleting user: ' + err.message);
        }
      });
    }
  }

  deleteJournal() {
    if (!this.selectedJournal) return;
    
    if (confirm('Are you sure you want to delete this journal entry?')) {
      console.log('Deleting journal:', this.selectedJournal);
      
      const authHeaders = this.authService.getAuthHeaders();
      const headers = { 
        'Content-Type': 'application/json',
        ...authHeaders
      };
      
      this.http.delete<any>(`/api/admin/journal/${this.selectedJournal.id}`, { headers }).subscribe({
        next: response => {
          if (response.status === 0) {
            console.log('Journal deleted successfully');
            // Remove journal from local array
            this.journals = this.journals.filter(journal => journal.id !== this.selectedJournal.id);
            // Clear selection
            this.selectedJournal = null;
          } else {
            console.error('Failed to delete journal:', response.message);
            alert('Failed to delete journal: ' + response.message);
          }
        },
        error: err => {
          console.error('Error deleting journal:', err);
          alert('Error deleting journal: ' + err.message);
        }
      });
    }
  }

  onLogout() {
    this.authService.logout();
  }

  onHomeNavigate() {
    this.router.navigate(['/']);
  }
}
