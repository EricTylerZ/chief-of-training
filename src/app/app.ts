import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="cot-app">
      <router-outlet />
    </div>
  `,
  styles: [`
    .cot-app {
      min-height: 100vh;
      background: #0f1419;
      color: #d4cec4;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      --accent: #e8b94a;
    }
  `],
})
export class App {}
