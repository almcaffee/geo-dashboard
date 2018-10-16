/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { GeonamesService, Profile } from '../../services/geonames.service';
import * as moment from 'moment';
import { Popup } from './popup';
import { timer } from 'rxjs';

export interface Location  {
  lat?: number;
  lng?: number;
  cluster?: boolean;
  profiles?: Profile[];
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('gmap') gmapElement: any;
  @ViewChild('content') content: any;

  zoom: number;
  locations: Location[] = [];
  markers: any[] = [];
  popup: any;
  // Map variables
  map: google.maps.Map;
  bounds: google.maps.LatLngBounds;
  drawingManager: google.maps.drawing.DrawingManager;
  closePopup: Function;

  filter: any;
  paths: any[] = [];
  network: Profile[] = [];
  profile: Profile;

  teamColors: any[] = [
    { BLUE: '#0000FF' },
    { ORANGE: '#FFA500' },
    { GREEN: '#FFA500' },
    { RED: '#FF0000' },
    { YELLOW: '#FFFF00' }
  ];

  constructor(private gs: GeonamesService, private el: ElementRef) {
    this.gs.points$.subscribe(data=> console.log(data));
    this.gs.network$.subscribe(network=> this.setNetwork(network));
    this.gs.filter$.subscribe(filter=> this.getLocations(filter));
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if(this.gmapElement) {
      this.zoom = 10;
      this.map = new google.maps.Map(this.gmapElement.nativeElement,
      {
        center: new google.maps.LatLng(38.869753,-77.374371),
        zoom: this.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'greedy',
        maxZoom: 20,
        minZoom: 7
      });
      timer(500).subscribe(()=> {
        this.gs.getNetwork();
        this.map.addListener('zoom_changed', ()=> {
          this.hidePopup();
          this.changeMarkers(this.map.getZoom());
        });
        this.addState('virginia');
      });
    }
  }

  ngOnDestroy() {
    this.markers = [];
    this.closePopup();
  }

  addConnections(id?: number) {
    this.network.forEach(l=> {
      let p = this.network.find(p=> p.id === l.parentId);
      if(p) {
        let paths: any[] = [];
        paths.push({ lat: l.lat, lng: l.lng});
        paths.push({ lat: p.lat, lng: p.lng})
        let line = new google.maps.Polyline({
          path: paths,
          geodesic: true,
          strokeColor: l.team,
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        line.setMap(this.map);
        this.paths.push(line);
      }
    });
  }

  addPoints() {}

  addState(stateName: string) {
    this.map.data.loadGeoJson('../assets/files/'+stateName+'.json');
    this.map.data.setStyle({
      fillOpacity: 0.05,
      strokeWeight: 2
    });
  }

  addMap() {}

  addMarkers(scale?: number) {
    this.markers.forEach(m=> m.setMap(null));
    this.markers = [];
    let colors = this.teamColors;
    this.locations.forEach((l, i)=> {
      let position = new google.maps.LatLng(l.lat, l.lng);
      if(!l.cluster) {
        let marker = new google.maps.Marker({
          position: position,
          icon: {
            url: l.profiles[0].pic,
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(20, 0),
            scaledSize: scale ? new google.maps.Size(scale, scale) : new google.maps.Size(50, 50)
          },
          map: this.map
        });
        marker.addListener('click', ()=> {
          this.map.panTo(position);
          this.getPopup(position, l.profiles[0]);
        });
        this.markers.push(marker);
      } else {
        let marker = new google.maps.Marker({
          position: position,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 0.5,
            fillColor: l.cluster ? '#0156e5' : l.profiles[0].team,
            strokeOpacity: 1.0,
            strokeColor: l.cluster ? '#023da1' : l.profiles[0].team,
            strokeWeight: 3.0,
            scale: scale ? scale : 20 //pixels
          },
          map: this.map
        });
        let label: any = {
          color: '#ffffff',
          fontWeight: '700',
          text: l.profiles.length.toString()
        };
        marker.setLabel(label);
        marker.addListener('click', ()=> {
          this.map.panTo(position);
          this.map.setZoom(this.map.getZoom()+1)
        });
        this.markers.push(marker);
      }
    });
    if(!this.bounds) this.setBounds();
  }

  /* Change the marker size based on zoom level */
  changeMarkers(zoom: number) {
    this.zoom = zoom;
    this.removeMarkers();
    let scale = this.getScaleMarkerPx(zoom);
    this.getLocations();
  }

  checkProximity(c: any, d: any): boolean {
    let px = this.getScalePx();
    let a = this.getPixelLocation(new google.maps.LatLng(c.lat,c.lng));
    let b = this.getPixelLocation(new google.maps.LatLng(d.lat,d.lng));
    return Math.abs(a.x - b.x) <= px && Math.abs(a.y - b.y) <= px ? true : false;
  }

  clickedCluster() {
    this.map.setZoom(this.map.getZoom() + 1);
  }

  findProfile(p: Profile): boolean {
    return this.locations.findIndex(l=> l.profiles.indexOf(p) > -1) > -1 ? true : false;
  }

  getLocations(filter?: any) {
    this.locations = [];
    this.network.forEach((p,i)=> {
      if((filter && p[Object.keys(filter)[0]] === filter[Object.keys(filter)[0]]) || !filter) {
        if(!this.findProfile(p)) {
          let l: Location = { lat: p.lat, lng: p.lng, cluster: false, profiles: [p] };
          let filterArray: any[];
          if(filter) {
            let key = Object.keys(filter)[0];
            filterArray = this.network.filter(n=> this.checkProximity({ lat: n.lat, lng: n.lng }, { lat: p.lat, lng: p.lng}) && n != p && n[key] === filter);
          } else {
            filterArray = this.network.filter(n=> this.checkProximity({ lat: n.lat, lng: n.lng }, { lat: p.lat, lng: p.lng}) && n != p);
          }
          if(!filterArray.length) {
            this.locations.push(l);
          } else {
            let lat: number = p.lat;
            let lng: number = p.lng;
            filterArray.forEach(n=> {
              if(!this.findProfile(n)) {
                lat+= n.lat;
                lng+= n.lng;
                l.profiles.push(n);
              }
            });
            if(l.profiles.length > 1) {
              l.cluster = true;
              l.lat = lat/l.profiles.length;
              l.lng = lng/l.profiles.length;
            }
            this.locations.push(l);
          }
        }
      }
    });
    this.addMarkers();
  }

  getPopup(position: any, profile: Profile) {
    // if(this.popup) this.popup.destroy();
    this.profile = profile;
    timer(100).subscribe(()=> {
      this.setPopup();
      let content = document.getElementById('content');
      this.popup = new Popup(position, content);
      this.popup.setMap(this.map);
    })
  }

  /* Distance definitions for zoom/clustering */
  getScaleMarkerPx(zoom: number): number {
    if(zoom >= 12) {
      return 35;
    } else {
      switch (zoom) {
        case 11: return 20;
        case 10: return 20;
        case 9: return 20;
        case 8: return 20;
        case 7: return 20;
        default: return 20;
      }
    }
  }

  /* Distance definitions for zoom/clustering */
  getScalePx(): number {
    switch (this.zoom) {
      case 11: return 80;
      case 12: return 80;
      case 13: return 70;
      case 14: return 70;
      case 15: return 60;
      case 15: return 60;
      case 16: return 50;
      case 17: return 50;
      case 18: return 40;
      case 19: return 30;
      case 20: return 25;
      default: return 100;
    }
  }

  getPixelLocation(currentLatLng: any): any {
      let scale = Math.pow(2, this.map.getZoom());
      // The NorthWest corner of the current viewport corresponds
      // to the upper left corner of the map.
      // The script translates the coordinates of the map's center point
      // to screen coordinates. Then it subtracts the coordinates of the
      // coordinates of the map's upper left corner to translate the
      // currentLatLng location into pixel values in the <div> element that hosts the map.
      let nw = new google.maps.LatLng(
          this.map.getBounds().getNorthEast().lat(),
          this.map.getBounds().getSouthWest().lng()
      );
      // Convert the nw location from geo-coordinates to screen coordinates
      let worldCoordinateNW = this.map.getProjection().fromLatLngToPoint(nw);
      // Convert the location that was clicked to screen coordinates also
      let worldCoordinate = this.map.getProjection().fromLatLngToPoint(currentLatLng);
      let currentLocation = new google.maps.Point(
          Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
          Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
      );
      return currentLocation;
  }

  hidePopup() {
    let content = document.getElementById('content');
    content.classList.add('hide-popup');
  }

  removeMarkers() {
    this.markers.forEach(m=> m.setMap(null));
    this.markers = [];
  }

  removePaths() {
    this.paths.forEach(p=> p.setMap(null));
    this.markers = [];
  }

  setBounds() {
    this.bounds = new google.maps.LatLngBounds();
    this.markers.forEach(m=> {
      this.bounds.extend(m.position);
    });
    this.map.setCenter(this.bounds.getCenter());
    this.map.fitBounds(this.bounds);
  }

  setNetwork(nw: Profile[]) {
    this.network = nw;
    this.profile = this.network[0];
    this.getLocations();
  }

  setPopup() {
    let content = document.getElementById('content');
    content.classList.remove('hide-popup');
    let img = document.getElementById('profile-face');
    img.setAttribute('src',this.profile.pic);
    img.setAttribute('alt',this.profile.name);
    let name = document.getElementById('profile-header');
    name.innerText = this.profile.name;
    let date = document.getElementById('profile-date');
    img.innerText = moment(this.profile.date).format('M/d/Y');
    let desc = document.getElementById('profile-text');
    desc.innerText = this.profile.description;
    let close = document.getElementById('profile-close');
    close.addEventListener('click', ()=> this.hidePopup());
  }

  updateMarkers() {
    this.addMarkers();
  }

}
