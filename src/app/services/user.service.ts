import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, Subject, of } from 'rxjs';
import { Group, LocationCriteria, Network, Organization, SuccessResponse, User } from '@models';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  API_URL = environment.api+'/api/user/';
  GEO_API_URL = 'http://api.geonames.org/';

  constructor(private http: HttpClient) {   console.log(environment.api); }

  addNetworkById(network: Network): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(this.API_URL+'network', network);
  }

  createGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(this.API_URL+'group/create', group);
  }

  createOrganization(org: Organization): Observable<Organization> {
    return this.http.post<Organization>(this.API_URL+'organization/create', org);
  }

  createUser(user: User) {
    return this.http.post<User>(this.API_URL+'create', user);
  }

  getGroupById(id: any): Observable<Group> {
    return this.http.get<Group>(this.API_URL+'group/'+id);
  }

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.API_URL+'groups');
  }

  getNetworkByGroupId(id: any): Observable<Network> {
    return this.http.get<Network>(this.API_URL+'network/groupId/'+id);
  }

  getNetworkByOrganizationId(id: any): Observable<Network> {
    return this.http.get<Network>(this.API_URL+'network/organizationId/'+id);
  }

  getNetworkByUserId(id: any): Observable<Network> {
    return this.http.get<Network>(this.API_URL+'network/userId/'+id);
  }

  getOrganizationById(id: any): Observable<Organization> {
    return this.http.get<Organization>(this.API_URL+'organization/organizationId/'+id);
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.API_URL+'organizations');
  }

  getUserById(id: any): Observable<User> {
    return this.http.get<User>(this.API_URL+'id/'+id);
  }

  getUsersByGroupId(id: any, userId?: any): Observable<User[]> {
    let url = this.API_URL+'groupId/'+id;
    if(userId) url += '/userId/'+userId;
    return this.http.get<User[]>(url);
  }

  getUsersByOrganizationId(id: any, userId?: any): Observable<User[]> {
    let url = this.API_URL+'organizationId/'+id;
    if(userId) url += '/userId/'+userId;
    return this.http.get<User[]>(url);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL+'all');
  }

  /* args represents an the value of the passed in form as an object */
  searchAddress(args: any): Observable<any> {
    let url = this.GEO_API_URL+'geoCodeAddressJSON?username=almcaffee&q=';
    console.log(args)
    Object.keys(args).forEach((key, i)=> {
      if(key != 'lat' && key != 'lng') {
        if(args[key] && key.indexOf('Ext') > -1) {
          url+= '-'+args[key].toString();
        } else if(args[key]){
          url+= args[key].toString().split(' ').join('+');
        }
        if(1 < Object.keys(args).length - 1 && args[key]) url+= '+';
      }
    });
    return this.http.get(url);
  }

  searchLocation(args: any): Observable<any> {
    let url = this.GEO_API_URL+'searchJSON?username=almcaffee&q=';
    Object.keys(args).forEach((k, i)=> {
      url+= '&'+k+'='+args[k];
    });
    return this.http.get(url);
  }

  setOrganizationLocation(criteria: LocationCriteria): Observable<Organization> {
    return this.http.put<User>(this.API_URL+'organization/location', criteria);
  }

  setUserLocation(criteria: LocationCriteria): Observable<User> {
    return this.http.put<User>(this.API_URL+'location', criteria);
  }

  test() {
    return this.http.get(this.API_URL+'test');
  }

  handleError(err: any) {
    console.log(err)
  }
}
