import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MapComponent } from '@components/map/map.component';
import { SideBarComponent } from '@components/side-bar/side-bar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';
import { environment } from '@environments/environment';
import { AppRoutes } from './routes';
import { NavComponent } from '@components/nav/nav.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SideBarComponent,
    NavComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgbModule,
    RouterModule.forRoot(AppRoutes)
  ],
  providers: [{provide: APP_BASE_HREF, useValue: environment.base}],
  bootstrap: [AppComponent]
})
export class AppModule { }
