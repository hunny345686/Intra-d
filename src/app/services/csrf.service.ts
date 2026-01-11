import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggerService } from './logger.service';
import { APP_CONSTANTS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private readonly tokenKey = 'csrf-token';
  private readonly allowedDomains = ['api.openweathermap.org', 'localhost', '127.0.0.1'];

  constructor(private logger: LoggerService) {}

  generateToken(): string {
    try {
      const token = this.createRandomToken();
      sessionStorage.setItem(this.tokenKey, token);
      this.logger.debug('CSRF token generated');
      return token;
    } catch (error) {
      this.logger.error('Error generating CSRF token', error);
      return '';
    }
  }

  getToken(): string | null {
    try {
      return sessionStorage.getItem(this.tokenKey);
    } catch (error) {
      this.logger.error('Error retrieving CSRF token', error);
      return null;
    }
  }

  validateToken(token: string): boolean {
    try {
      const storedToken = this.getToken();
      const isValid = storedToken === token && token.length === 64;
      if (!isValid) {
        this.logger.warn('CSRF token validation failed');
      }
      return isValid;
    } catch (error) {
      this.logger.error('Error validating CSRF token', error);
      return false;
    }
  }

  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const isAllowed = this.allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
      
      if (!isAllowed) {
        this.logger.warn('Blocked request to unauthorized domain', { domain: urlObj.hostname });
      }
      
      return isAllowed;
    } catch (error) {
      this.logger.error('Error validating URL', error);
      return false;
    }
  }

  private createRandomToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  constructor(
    private csrfService: CsrfService,
    private logger: LoggerService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    try {
      // Validate URL for SSRF protection
      if (!this.csrfService.validateUrl(req.url)) {
        this.logger.error('Blocked SSRF attempt', { url: req.url });
        return throwError(() => new Error('Unauthorized request'));
      }

      let modifiedReq = req;

      // Add CSRF token for non-GET requests
      if (req.method !== 'GET') {
        const token = this.csrfService.getToken();
        if (token) {
          modifiedReq = req.clone({
            setHeaders: { [APP_CONSTANTS.SECURITY.CSRF_HEADER]: token }
          });
          this.logger.debug('CSRF token added to request');
        }
      }

      return next.handle(modifiedReq).pipe(
        retry(1),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('HTTP request failed', {
            url: req.url,
            status: error.status,
            message: error.message
          });
          return throwError(() => error);
        })
      );
    } catch (error) {
      this.logger.error('CSRF interceptor error', error);
      return throwError(() => error);
    }
  }
}