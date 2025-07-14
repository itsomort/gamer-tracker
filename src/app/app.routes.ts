import { Routes } from '@angular/router';
import { Signup } from './signup/signup';
import { Home } from './home/home';
import { Journal } from './journal/journal'; 

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'signup', component: Signup },
  { path: 'journal', component: Journal }, 
  { path: '**', redirectTo: '' } // Redirect any unknown paths to home
];
