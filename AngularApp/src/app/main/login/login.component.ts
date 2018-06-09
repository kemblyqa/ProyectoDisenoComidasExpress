import { Component, OnInit } from '@angular/core';
import { ManagerService } from './../../services/manager/manager.service';
import { ChangeDetectorRef } from '@angular/core';

import { environment } from './../../../environments/environment';
import firebase from '@firebase/app';
import '@firebase/auth';
const app = firebase.initializeApp(environment.firebase);
const provider = new firebase.auth.GoogleAuthProvider();

declare var jquery: any;
declare var $: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private user: {email, photoURL, displayName, restaurantes, nombre, telefono} =
    { email: '',
      photoURL: '../../assets/icons/profile.png',
      displayName: '',
      restaurantes: [],
      nombre: '',
      telefono: ''};
  private failedMessage: String;
  private restLocation: Array<any> = [0,0]
  constructor(private ref: ChangeDetectorRef, private _managerService: ManagerService) {
  }

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
  openMapModal(){
    $("#modalUserMap").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  markPosition(e){
    this.restLocation[0]= e.coords.lat;
    this.restLocation[1]= e.coords.lng;
  }
}
