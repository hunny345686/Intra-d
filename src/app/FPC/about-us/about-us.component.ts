import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule], // Import CommonModule here for *ngFor
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent {
  // Array to hold team member data
  teamMembers = [
    {
      name: 'D Uday Kumar',
      role: 'Founder',
      imageUrl: 'assets/images/uday.jpeg', // Dummy image
    },

    {
      name: 'B Vamseedhara Reddy',
      role: 'CTO',
      imageUrl: 'assets/images/vamshi.jpeg',
    },

    {
      name: 'Bhavani Hari',
      role: 'Director CMO',
      imageUrl: 'assets/images/hari.jpeg',
    },
    {
      name: 'Chekuri Naresh Babu',
      role: 'Director',
      imageUrl: 'assets/images/naresh.jpeg',
    },
    {
      name: 'Singamala Siva Prasad',
      role: 'Director',
      imageUrl: 'https://placehold.co/500x500?text=SivaPrasad',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    // Initialization logic can go here if needed
  }
}
