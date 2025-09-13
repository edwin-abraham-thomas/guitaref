import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: Theme = 'light';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // Initialize theme from localStorage if available
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        // Default to light theme
        this.setTheme('light');
      }
    }
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    
    if (isPlatformBrowser(this.platformId)) {
      // Update the HTML class
      const htmlElement = document.documentElement;
      if (theme === 'dark') {
        htmlElement.classList.add('dark-theme');
      } else {
        htmlElement.classList.remove('dark-theme');
      }
      
      // Save to localStorage
      localStorage.setItem('theme', theme);
    }
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
