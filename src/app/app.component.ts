import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpCallsService } from 'src/utils/http-calls.service';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import * as CryptoJS from 'crypto-js';
import { Constants } from 'src/utils/constants';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'task-manager-ui';
  isSignIn: boolean;
  signInOrUpForm: FormGroup;
  userLoggedIn: boolean;
  displayName: string;

  constructor(private fb: FormBuilder, private call: HttpCallsService,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
    private router: Router) { }

  ngOnInit() {
    if (this.sessionStorage && this.sessionStorage.get(Constants.AUTH_TOKEN)) {
      this.userLoggedIn = true;
      const user = {
        firstName : this.sessionStorage.get(Constants.FIRST_NAME),
        lastName : this.sessionStorage.get(Constants.LAST_NAME)
      }
      this.getDisplayName(user);
    }
    else
      this.userLoggedIn = false;
    this.isSignIn = false;
    this.buildFormGroups();
  }

  buildFormGroups() {
    this.signInOrUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
      email: ['', Validators.email]
    }, { validator: this.checkIfMatchingPasswords('password', 'passwordConfirm') });
  }


  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true })
      }
      else {
        return passwordConfirmationInput.setErrors(null);
      }
    }
  }

  signIn() {
    this.isSignIn = true;
  }

  signUp() {
    this.isSignIn = false;
  }

  switchSignInOrUp() {
    this.signInOrUpForm.reset();
    if (this.isSignIn)
      this.signUp();
    else
      this.signIn();
  }

  getErrorMessage(formControlNameVal?) {
    if (formControlNameVal)
      return this.signInOrUpForm.controls[formControlNameVal].hasError('required') ? 'You must enter a value' :
        (formControlNameVal === 'passwordConfirm' &&
          this.signInOrUpForm.controls.passwordConfirm.hasError('notEquivalent')) ? 'Passwords don\'t match' : '';
    else
      return this.signInOrUpForm.controls.email.hasError('required') ? 'You must enter a value' :
        this.signInOrUpForm.controls.email.hasError('email') ? 'Not a valid email' : '';
  }

  submitSignInOrUp() {
    if (this.isSignIn)
      this.signInUser();
    else
      this.signUpUser();
  }

  signInUser() {
    const form = this.signInOrUpForm.value;
    const password = CryptoJS.AES.encrypt(form.password.trim(), 'task-managerv1').toString();
    const body = { username: form.userName, password };
    this.call.signIn(body).subscribe(response => {
      if (response && response.user)
        this.storeUserDetails(response.user);
    });
  }

  signUpUser() {
    const form = this.signInOrUpForm.value;
    const password = CryptoJS.AES.encrypt(form.password.trim(), 'task-managerv1').toString();
    const body = {
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.userName ? (form.userName).toLowerCase() : null,
      password,
      email: form.email
    }
    this.call.signUp(body).subscribe(response => {
      if (response && response.user) {
        this.storeUserDetails(response.user);
      }
    })
  }

  storeUserDetails(user) {
    if (user) {
      this.sessionStorage.set(Constants.FIRST_NAME, user.firstName || null);
      this.sessionStorage.set(Constants.LAST_NAME, user.lastName || null);
      this.sessionStorage.set(Constants.USER_EMAIL, user.email || null);
      this.sessionStorage.set(Constants.USER_NAME, user.userName || null);
      this.userLoggedIn = true;
      $('#signInOrUp').modal('hide');
      this.signInOrUpForm.reset();
      this.getDisplayName(user);
      this.router.navigate(['/home']);
    }
  }

  getDisplayName(user) {
    if (user.firstName && user.lastName)
      this.displayName = user.firstName + ' ' + user.lastName;
    else if (user.firstName)
      this.displayName = user.firstName;
    else if (user.lastName)
      this.displayName = user.lastName;
    else
      this.displayName = null;
  }

  disableFlag() {
    if (this.isSignIn && this.signInOrUpForm.controls.userName.valid
      && this.signInOrUpForm.controls.password.valid)
      return false;
    else if (!this.isSignIn && this.signInOrUpForm.valid)
      return false;
    else
      return true;
  }

  signOut() {
    this.call.postCall('signout', {}).subscribe(response => {
      this.userLoggedIn = false;
      this.call.headers = new HttpHeaders();
      this.sessionStorage.remove(Constants.FIRST_NAME);
      this.sessionStorage.remove(Constants.LAST_NAME);
      this.sessionStorage.remove(Constants.USER_EMAIL);
      this.sessionStorage.remove(Constants.USER_NAME);
      this.sessionStorage.remove(Constants.AUTH_TOKEN);
      this.router.navigate(['']);
    })
  }
}
