import { Directive, ElementRef, OnInit } from '@angular/core';
import { CsrfService } from '../services/csrf.service';

@Directive({
  selector: 'form[secureForm]',
  standalone: true
})
export class SecureFormDirective implements OnInit {
  constructor(
    private el: ElementRef<HTMLFormElement>,
    private csrfService: CsrfService
  ) {}

  ngOnInit(): void {
    const form = this.el.nativeElement;
    const token = this.csrfService.generateToken();
    
    // Add hidden CSRF token input
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'csrfToken';
    tokenInput.value = token;
    form.appendChild(tokenInput);
  }
}