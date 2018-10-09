import { Injectable } from '@angular/core';
import { Observable, Subscription, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  locations = new Subject<any>();
  locations$ = this.locations.asObservable();

  constructor() { }
}
