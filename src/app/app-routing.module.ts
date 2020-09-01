import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { RoutingGuard } from './routing.guard';

const routes: Routes = [
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'editor',
    component: EditorComponent,
    canActivate: [RoutingGuard],
  },
  {
    path: '**',
    redirectTo: 'editor',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [RoutingGuard]
})
export class AppRoutingModule {}
