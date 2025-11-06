import { Routes } from '@angular/router';
import { AdminComponent } from './features/configuration/admin.component';
import { AssessmentComponent } from './features/assessment/assessment.component';
import { HomeComponent } from './core/components/home.component';
import { ReportsComponent } from './features/reports/reports.component';
import { LogsComponent } from './features/logs/logs.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminComponent }, // Legacy route for compatibility
  { path: 'configuration', component: AdminComponent },
  { path: 'assessment', component: AssessmentComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'logs', component: LogsComponent },
  { path: 'results', redirectTo: '/reports', pathMatch: 'full' }, // Redirect to reports
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

