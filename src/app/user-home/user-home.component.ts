import { Component, OnInit, Inject } from '@angular/core';
import { WebStorageService, SESSION_STORAGE } from 'angular-webstorage-service';
import { Router } from '@angular/router';
import { Constants } from 'src/utils/constants';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {

  constructor(@Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
    private router: Router) { }

  ngOnInit() {
    if( !this.sessionStorage.get(Constants.AUTH_TOKEN))
      this.router.navigate(['']);
  }

}
