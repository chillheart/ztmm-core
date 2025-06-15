import { Routes } from '@angular/router';
import { AdminComponent } from './features/configuration/admin.component';
import { AssessmentComponent } from './features/assessment/assessment.component';
import { ResultsComponent } from './features/reports/results.component';
import { HomeComponent } from './core/components/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminComponent }, // Legacy route for compatibility
  { path: 'configuration', component: AdminComponent },
  { path: 'assessment', component: AssessmentComponent },
  { path: 'results', component: ResultsComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
