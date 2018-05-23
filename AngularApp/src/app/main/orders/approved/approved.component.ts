import { ManagerService } from './../../../services/manager/manager.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ManagerModel } from '../../../models/manager.model';
import { Pedido } from '../../../models/manager';
import { } from '@types/googlemaps';

declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.css']
})
export class ApprovedComponent implements OnInit{
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  /* modal messages */
  private successMessage:any
  private failedMessage:any
  /* restaurante id y nombre */ 
  private restName:string = "Soda El Mercadito" 
  private restId:string = "rest4" 
  /* headers */
  private manage:ManagerModel
  private headers:Array<any>
  private orders:Pedido[] = []
  /* pagination */
  private page:number = 1
  private totalPages:number
  /* gmaps api */
  currentLat:any
  currentLong:any
  marker:any
  constructor(private _managerService:ManagerService) {
    this.manage = new ManagerModel()
    this.headers = this.manage.getApprovedTableHeaders()
    this.getOrders()
  }
  /* init method */
  ngOnInit() {
    /* init map *//* default location (will be Santa Clara) */
    var mapProp = {
      
      center: new google.maps.LatLng(10.362167730785652, -84.51030575767209),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

    // this.map.addListener('click', (e) => {
    //   this.placeMarkerAndPanTo(e.latLng, this.map);
    // });
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

  showClientPosition(lat:any, lng:any){
    let location = new google.maps.LatLng(lat, lng);
    this.map.panTo(location);

    if (this.marker) {
       this.marker.setPosition(location);
    }
    else {
      this.marker = new google.maps.Marker({
        position: location,
        map: this.map
      });
    }
  }
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
  /* find the place and puts a mark in map */
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
  /* pagination */
  updateApprovedPagination(e){
    this.page = e
    this.getOrders()
  }
  /* modal success! */
  successMessageModal(message:any){
    this.successMessage = message
    $("#modalSuccess").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* failed success! */
  failedMessageModal(message:any){
    this.failedMessage = message
    $("#modalFailed").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* open map modal */
  openMapModal(lat:any, lng:any){
    this.showClientPosition(lat,lng)
    $("#modalMap").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* get approved orders */
  getOrders(){
    this._managerService.getCustomOrders("keyAuto","aprobado")
    .subscribe(
      success => {
        if(success.status){
          this.orders = success.data[0]
          this.totalPages = success.data[1] * 10
        } else {
          this.failedMessageModal(success.data)
        }
      }
    )
  }
  /* finish orders */
  isFinished(id:any){
    this._managerService.changeStatus(id, "finalizado")
    .subscribe(
      success => {
        if(success.status){
          this.successMessageModal(success.data)
          this.getOrders()
        } else {
          this.failedMessageModal(success.data)
        }
      }
    )
  }
}
