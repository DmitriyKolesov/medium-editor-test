import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
})
export class HeaderComponent implements OnInit {

  userProfile$ = this.userService.userProfile$

  constructor(private userService: UserService) { }

  ngOnInit() {

  }

  async signOut() {
    await this.userService.signOut();
  }

}
