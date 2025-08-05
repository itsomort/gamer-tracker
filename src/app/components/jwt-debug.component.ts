import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-jwt-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jwt-debug-panel" *ngIf="showDebug">
      <h3>🔐 JWT Debug Info</h3>
      <div class="debug-section">
        <h4>Token Status:</h4>
        <p>Has Token: <span [class]="hasToken ? 'success' : 'error'">{{hasToken}}</span></p>
        <p>Is Authenticated: <span [class]="isAuthenticated ? 'success' : 'error'">{{isAuthenticated}}</span></p>
      </div>
      
      <div class="debug-section" *ngIf="tokenInfo">
        <h4>Token Info:</h4>
        <pre>{{tokenInfo | json}}</pre>
      </div>
      
      <div class="debug-section" *ngIf="currentUser">
        <h4>Current User:</h4>
        <pre>{{currentUser | json}}</pre>
      </div>
      
      <button (click)="refreshInfo()" class="refresh-btn">🔄 Refresh</button>
      <button (click)="toggleDebug()" class="toggle-btn">❌ Close</button>
    </div>
    
    <button *ngIf="!showDebug" (click)="toggleDebug()" class="debug-toggle">🔐 JWT Debug</button>
  `,
  styles: [`
    .jwt-debug-panel {
      position: fixed;
      top: 10px;
      right: 10px;
      background: #1a1a1a;
      color: #fff;
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      font-family: monospace;
      font-size: 12px;
    }
    
    .debug-section {
      margin-bottom: 15px;
      padding: 10px;
      background: #2a2a2a;
      border-radius: 4px;
    }
    
    .success { color: #4caf50; }
    .error { color: #f44336; }
    
    pre {
      background: #333;
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    
    .refresh-btn, .toggle-btn {
      margin: 5px;
      padding: 8px 12px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .toggle-btn {
      background: #f44336;
    }
    
    .debug-toggle {
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      z-index: 9999;
    }
  `]
})
export class JwtDebugComponent implements OnInit {
  showDebug = false;
  hasToken = false;
  isAuthenticated = false;
  tokenInfo: any = null;
  currentUser: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.refreshInfo();
  }

  refreshInfo() {
    this.hasToken = this.authService.hasToken();
    this.currentUser = this.authService.getCurrentUser();
    
    this.authService.isAuthenticated().subscribe(auth => {
      this.isAuthenticated = auth;
    });

    // Decode JWT token
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.tokenInfo = {
          username: payload.username,
          email: payload.email,
          exp: payload.exp,
          expires: new Date(payload.exp * 1000).toLocaleString(),
          isExpired: payload.exp < (Date.now() / 1000)
        };
      } catch (error) {
        this.tokenInfo = { error: 'Invalid token format' };
      }
    }
  }

  toggleDebug() {
    this.showDebug = !this.showDebug;
    if (this.showDebug) {
      this.refreshInfo();
    }
  }
}
