import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { GeonamesService, Profile } from '../../services/geonames.service';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  profile: Profile;
  network: Profile[] = [];

  displayedColumns: string[] = ['id', 'name', 'date', 'team', 'map'];
  dataSource: MatTableDataSource<object>;

  constructor(private gs: GeonamesService, private el: ElementRef) {
    this.gs.network$.subscribe(network=> this.setNetwork(network));
  }

  ngOnInit() {
  }

  setNetwork(nw: Profile[]) {
    this.dataSource = new MatTableDataSource(nw);
    timer(200).subscribe(()=>  {
      this.dataSource.paginator = this.paginator;
    });
  }

  filterMap(filter: any) {
    this.gs.filter.next(filter);
  }

}
