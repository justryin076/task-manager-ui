import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dummyProfilePic: String;
  constructor() { }

  ngOnInit() {
    if (Math.random() > 0.5)
      this.dummyProfilePic = '../../assets/male.png';
    else
      this.dummyProfilePic = '../../assets/female.png';
  }

}
