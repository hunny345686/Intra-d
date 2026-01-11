import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizerService {
  constructor(private domSanitizer: DomSanitizer) {}

  sanitizeHtml(html: string): SafeHtml {
    return this.domSanitizer.sanitize(1, html) || '';
  }

  sanitizeUrl(url: string): SafeUrl {
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    try {
      const urlObj = new URL(url);
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return '';
      }
      return this.domSanitizer.sanitize(4, url) || '';
    } catch {
      return '';
    }
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
    return phoneRegex.test(phone);
  }
}