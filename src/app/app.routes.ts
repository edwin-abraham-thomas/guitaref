import { Routes } from '@angular/router';
import { FretboardDemoComponent } from './components/fretboard-demo/fretboard-demo.component';

export const routes: Routes = [
  { path: '', redirectTo: '/fretboard-demo', pathMatch: 'full' },
  { path: 'fretboard-demo', component: FretboardDemoComponent }
];
