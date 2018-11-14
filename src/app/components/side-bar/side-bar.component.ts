import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { GeonamesService, Profile } from '../../services/geonames.service';
import * as moment from 'moment';
import { timer } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  profile: Profile;
  network: Profile[] = [];
  panelOpenState: boolean;

  constructor(private gs: GeonamesService, private el: ElementRef) {
    this.gs.network$.subscribe(network=> this.setNetwork(network));
  }

  ngOnInit() {
  }

  setNetwork(nw: Profile[]) {
  }

  filterMap(filter: any) {
    this.gs.filter.next(filter);
  }

}
