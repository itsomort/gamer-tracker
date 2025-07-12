import { Routes } from '@angular/router';

import { Signup } from './signup/signup';

import { App } from './app';

export const routes: Routes = [
  { path: '', component: App },
  { path: 'signup', component: Signup },
];
