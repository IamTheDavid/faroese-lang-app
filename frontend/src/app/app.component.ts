import { Component } from '@angular/core';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { IonApp, IonFooter, IonContent, IonRouterOutlet } from "@ionic/angular/standalone";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonRouterOutlet, IonContent, IonFooter, IonApp, NavBarComponent],
  standalone: true,
})
export class AppComponent {
  showNavBar: boolean = true;
  constructor() {}
}
