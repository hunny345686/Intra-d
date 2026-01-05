import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private firestore: Firestore) {}

  // Farmers Count
  getFarmers(): Observable<any[]> {
    const ref = collection(this.firestore, 'farmers');
    return collectionData(ref, { idField: 'id' });
  }

  // Crop Supply
  getCropSupply(): Observable<any[]> {
    const ref = collection(this.firestore, 'crop_supply');
    return collectionData(ref, { idField: 'id' });
  }

  // Urgent Crops
  getUrgentCrops(): Observable<any[]> {
    const ref = query(
      collection(this.firestore, 'buyer_demand'),
      where('urgency', '==', 'HIGH')
    );
    return collectionData(ref, { idField: 'id' });
  }

  // Buyer Demand
  getBuyerDemand(): Observable<any[]> {
    const ref = collection(this.firestore, 'buyer_demand');
    return collectionData(ref, { idField: 'id' });
  }

  // Farmer Requests
  getFarmerRequests(): Observable<any[]> {
    const ref = collection(this.firestore, 'farmer_requests');
    return collectionData(ref, { idField: 'id' });
  }

  // Labour Requests
  getLabourRequests(): Observable<any[]> {
    const ref = collection(this.firestore, 'labour_requests');
    return collectionData(ref, { idField: 'id' });
  }
}
