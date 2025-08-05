import { Routes } from '@angular/router';
import { Signup } from './signup/signup';
import { Home } from './home/home';
import { Journal } from './journal/journal'; 
import { AdminPanel } from './admin-panel/admin-panel';
import { PrevEntries } from './prev-entries/prev-entries';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'signup', component: Signup },
  { path: 'journal', component: Journal }, 
  { path : 'admin', component: AdminPanel},
  { path : 'prev-entries', component: PrevEntries},
  { 
    path: '**', 
    redirectTo: '', 
    pathMatch: 'full',
    // clear query params
    resolve: {
      cleared: () => {
        window.location.href = window.location.pathname;
        return true;
      }
    }
  }
];
