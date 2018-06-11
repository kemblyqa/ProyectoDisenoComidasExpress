import { Component, OnInit } from '@angular/core';
import { ManagerService } from './../../services/manager/manager.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from './../../../environments/environment';
import firebase from '@firebase/app';
import '@firebase/auth';

const app = firebase.initializeApp(environment.firebase);
const provider = new firebase.auth.GoogleAuthProvider();
import { AgmMap } from '@agm/core';
declare var jquery: any;
declare var $: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  /* storage */
  private user: {email, photoURL, displayName, restaurantes, nombre, telefono} =
    { email: '',
      photoURL: '../../assets/icons/profile.png',
      displayName: '',
      restaurantes: [],
      nombre: '',
      telefono: ''};
  private defaultRestaurant: {id, name} = {id: "",name:""}
  private failedMessage: String;
  private restLocation: Array<any> = [10.362167730785652, -84.51030575767209];
  constructor(private ref: ChangeDetectorRef, private _router: Router, private _managerService: ManagerService) {}

  ngOnInit() {
  }
  login() {
    // Esto permite volver a elegir la cuenta
    provider.setCustomParameters({
       prompt: 'select_account'
    });
    firebase.auth().signInWithPopup(provider).then(result => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const token = result.credential.accessToken;
      // The signed-in user info.
      this.user.email = result.user.email;
      this.user.displayName = result.user.displayName;
      this.user.photoURL = result.user.photoURL;
      document.getElementById('EnterBtn').hidden = false;
      document.getElementById('LogoutBtn').hidden = false;
      document.getElementById('LoginBtn').hidden = true;
      this.ref.detectChanges();
    }).catch(error => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      const credential = error.credential;
      // ...
    });
  }
  logout() {
    firebase.auth().signOut().then(() => {
    // Sign-out successful.
    document.getElementById('LoginBtn').hidden = false;
    document.getElementById('EnterBtn').hidden = true;
    document.getElementById('LogoutBtn').hidden = true;
    this.user = { email: '',
      photoURL: '../../assets/icons/profile.png',
      displayName: '',
      restaurantes: [],
      nombre: '',
      telefono: ''};
    this.ref.detectChanges();
  }).catch((error) => {
      console.log(error);
      // An error happened.
    });
  }
  enter() {
    this._managerService.getUser(this.user.email)
    .subscribe(
      res => {
        if (res.status) {
          if (res.data.exists) {
            this.user.nombre = res.data.nombre;
            this.user.restaurantes = res.data.restaurantes;
            this.user.telefono = res.data.telefono;
            this.defaultRestaurant.id = "null"
            this.defaultRestaurant.name = "(No se ha escogido el restaurante)"
            sessionStorage.setItem('user', JSON.stringify(this.user));
            sessionStorage.setItem('currentRestaurant',JSON.stringify(this.defaultRestaurant))
            this._router.navigate(['dashboard']);
          } else {
            this.user.nombre = this.user.displayName;
            $('#register').modal({
              backdrop: 'static',
              keyboard: false,
              show: true
            });
          }
        } else {
          this.failedMessageModal(res.data);
        }
      }
    );
  }
  registerUser() {
    this._managerService.setUser(this.user.email, this.user.nombre, this.user.telefono, this.restLocation, undefined)
    .subscribe(res => {
      if (res.status) {
        this.enter();
      } else {
        this.failedMessageModal(res.data);
      }
    });
  }
  /* failed success! */
  failedMessageModal(message: any) {
    this.failedMessage = message;
    $('#modalFailed').modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    });
  }
  /* open map modal */
  openMapModal() {
    $('#modalUserMap').modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    });
  }
  markPosition(e) {
    this.restLocation[0] = e.coords.lat;
    this.restLocation[1] = e.coords.lng;
  }
}
