import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-loading',
  template: `
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="text-5xl mb-6">{{ icon }}</div>
        <h2 class="text-xl text-gray-300 font-medium mb-4">{{ message }}</h2>
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  `,
  imports: [CommonModule, IonicModule]
})
export class LoadingComponent {
  @Input() message: string = 'Loading...';
  @Input() icon: string = '📚';
}
