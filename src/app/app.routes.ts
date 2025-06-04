import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AssessmentComponent } from './assessment.component';
import { ResultsComponent } from './results.component';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminComponent }, // Legacy route for compatibility
  { path: 'configuration', component: AdminComponent },
  { path: 'assessment', component: AssessmentComponent },
  { path: 'results', component: ResultsComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
