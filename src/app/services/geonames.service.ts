import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, Subject, of } from 'rxjs';
import * as moment from 'moment';

export interface Profile {
  id?: number;
  name?: string;
  description?: string;
  pic?: string;
  date?: number;
  team?: string;
  lat?: number;
  lng?: number;
  parentId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeonamesService {

  GEO_API_URL = 'http://api.geonames.org/searchJSON?username=almcaffee';
  API_URL = 'http://localhost:8000/api/';

  connections = new Subject<any>();
  connections$ = this.connections.asObservable();
  filter = new Subject<any>();
  filter$ = this.filter.asObservable();
  network = new Subject<any>();
  network$ = this.network.asObservable();
  points = new Subject<any>();
  points$ = this.points.asObservable();
  state = new Subject<any>();
  state$ = this.state.asObservable();

  constructor(private http: HttpClient) { }

  searchLocation(args: any) {
    let url = this.GEO_API_URL;
    Object.keys(args).forEach((k, i)=> {
      url+= '&'+k+'='+args[k];
    });
    return this.http.get(url)
    .subscribe(res=> {
      return of(res);
    }, err=>{
      this.handleError(err);
      return of([]);
    });
  }

  getNetwork() {
    return this.http.get<Profile[]>(this.API_URL+'user/network')
    .subscribe(res=> {
      // console.log(res)
      this.network.next(this.generateRandomPoints(res));
    }, err=>{
      this.handleError(err);
      this.network.next([]);
    });
  }

  getState(stateName: string) {
    return this.http.get(this.API_URL+'user/'+stateName)
    .subscribe(res=> {
      // console.log(res)
      this.state.next(JSON.stringify(res));
    }, err=>{
      this.handleError(err);
      this.state.next(null);
    });
  }

  /**
* Generates number of random geolocation points given a center and a radius.
* @param  {Object} center A JS object with lat and lng attributes.
* @param  {number} radius Radius in meters.
* @param {number} count Number of points to generate.
* @return {array} Array of Objects with lat and lng attributes.
*/
generateRandomPoints(network: Profile[]): Profile[] {
  let center = { lat: 37.571451, lng: -78.385561 };
  let radius = 80467; // 500mi
  let points = [];
  network.forEach(p=> {
    let point = this.generateRandomPoint(center, radius);
    p.lat = point.lat;
    p.lng = point.lng;
    let dt = parseInt(p.date.toString());
    p.date = dt;
  });
  console.log(network)
  return network;
}


/**
* Generates number of random geolocation points given a center and a radius.
* Reference URL: http://goo.gl/KWcPE.
* @param  {Object} center A JS object with lat and lng attributes.
* @param  {number} radius Radius in meters.
* @return {Object} The generated random points as JS object with lat and lng attributes.
*/
generateRandomPoint(center: any, radius: number) {
  let x0 = center.lng;
  let y0 = center.lat;
  // Convert Radius from meters to degrees.
  let rd = radius/111300;

  let u = Math.random();
  let v = Math.random();

  let w = rd * Math.sqrt(u);
  let t = 2 * Math.PI * v;
  let x = w * Math.cos(t);
  let y = w * Math.sin(t);

  let xp = x/Math.cos(y0);

  // Resulting point.
  return {'lat': y+y0, 'lng': xp+x0};
}


  handleError(err: any) {
    console.log(err)
  }
}
