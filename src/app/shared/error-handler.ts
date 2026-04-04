import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error): void {
    const router = this.injector.get(Router);
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;

    if (chunkFailedMessage.test(error.message)) {
      window.location.reload();
      return;
    }

    if (error.message?.includes('Firebase') || error.message?.includes('Permission denied')) {
      alert('Database connection error. Please contact administrator.');
      return;
    }

    if (error.message?.includes('Network')) {
      alert('Network error. Please check your internet connection.');
      return;
    }

    alert('An unexpected error occurred. Please try again.');
  }
}
