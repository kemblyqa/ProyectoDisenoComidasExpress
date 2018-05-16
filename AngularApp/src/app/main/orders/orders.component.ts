import { Router } from '@angular/router';
import { ManagerService } from './../../services/manager/manager.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  constructor(private _managerService: ManagerService, private _router: Router) { }
  ngOnInit() { }
}