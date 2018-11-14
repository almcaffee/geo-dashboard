import { Routes } from '@angular/router';
import { MapComponent } from '@components/map/map.component';

export const AppRoutes: Routes = [
  {
    path: '*',
    component: MapComponent
  },
  {
    path: '**',
    component: MapComponent
  }
];
