import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ManagerModel } from '../../models/manager.model';
import { } from '@types/googlemaps';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit{
  // @ViewChild('gmap') gmapElement: any;
  // map: google.maps.Map;
  currentLat:any
  currentLong:any
  marker:any

  manage:ManagerModel
  navItems:Array<any>
  ngOnInit() {
    /* init map *//* default location (will be Santa Clara) */
    // var mapProp = {
      
    //   center: new google.maps.LatLng(10.362167730785652, -84.51030575767209),
    //   zoom: 15,
    //   mapTypeId: google.maps.MapTypeId.ROADMAP
    // };
    // this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

    // this.map.addListener('click', (e) => {
    //   this.placeMarkerAndPanTo(e.latLng, this.map);
    // });
  }

  constructor(private router: Router) { 
    this.manage = new ManagerModel()
    this.navItems = this.manage.getNavItems()
  }

  // findMe() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition((position) => {
  //       this.showPosition(position);
  //     });
  //   } else {
  //     alert("Geolocation is not supported by this browser.");
  //   }
  // }

  // showPosition(position) {
  //   this.currentLat = position.coords.latitude;
  //   this.currentLong = position.coords.longitude;

  //   let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  //   this.map.panTo(location);

  //   if (this.marker) {
  //      this.marker.setPosition(location);
  //   }
  //   else {
  //     this.marker = new google.maps.Marker({
  //       position: location,
  //       map: this.map,
  //       title: 'Got you!'
  //     });
  //   }
  // }

  // placeMarkerAndPanTo(latLng:google.maps.LatLng, map) {
  //   if (this.marker) {
  //     this.marker.setPosition(latLng);
  //   }
  //   else {
  //     this.marker = new google.maps.Marker({
  //       position: latLng,
  //       map: this.map,
  //       title: 'Got you!'
  //     });
  //   }
  //   console.log(latLng.lat())
  //   map.panTo(latLng);
  // }

  goTo(path:any){
    this.router.navigate([`dashboard${path}`])
  }
}
