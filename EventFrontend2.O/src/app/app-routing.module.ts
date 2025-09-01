import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HallDisplayComponent } from './feature-module/hall-display/hall-display.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  // Public hall display route - no authentication required
  {
    path: 'display/:hallName',
    component: HallDisplayComponent,
  },
  {
    path: '',
    loadChildren: () =>
      import('./feature-module/feature-module.module').then(
        (m) => m.FeatureModuleModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
