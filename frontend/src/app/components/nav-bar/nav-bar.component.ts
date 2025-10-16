import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { IonIcon, IonFooter } from '@ionic/angular/standalone';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  standalone: true,
  imports: [IonIcon],
})
export class NavBarComponent {
  constructor(private router: Router, private zone: NgZone) {}

  async go(url: string) {
    if (Capacitor.getPlatform() !== 'web') {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        console.warn('Haptics failed:', e);
      }
    }

    this.zone.run(() => this.router.navigateByUrl(url));
  }
}
