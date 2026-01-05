import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-career',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './career.component.html',
  styleUrl: './career.component.css',
})
export class CareerComponent {
  selectedLocation = '';
  selectedDomain = '';
  showSearchResults = false;
  foundJobs: any[] = [];
  
  locations = ['Anantapur', 'Kadapa','Tirupathi'];
  domains = ['Software Development', 'R&D', 'Marketing', 'Sales', 'Labour','Agricultural-Scientist','Soil test assistance','Electrican','Security Guard','Driver'];

  searchJobs() {
    this.showSearchResults = true;
    this.foundJobs = [];
  }
}
