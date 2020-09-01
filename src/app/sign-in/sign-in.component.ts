import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass']
})
export class SignInComponent implements OnInit, OnDestroy {

  sub = new Subscription();
  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.sub.add(
      this.userService.authorizedUserOnly$.subscribe(authorised =>
        authorised && this.router.navigate(['editor']))
    )
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async signInWithGoogle(): Promise<void> {
    await this.userService.signUp();
  }

}
