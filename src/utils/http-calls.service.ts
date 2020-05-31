import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { Constants } from './constants';

@Injectable({
  providedIn: 'root'
})
export class HttpCallsService {
  headers: HttpHeaders;
  baseURL: String;

  constructor(private http: HttpClient,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService) {
    this.baseURL = 'http://localhost:3000/';
    this.headers = new HttpHeaders();
  }

  getCall(url: string, queryParams?: [{ key: string, value: string }]) {
    const options = this.getOptions(queryParams);
    return this.http.get(this.baseURL + url, options);
  }

  postCall(url: string, body: any, queryParams?: [{ key: string, value: string }]) {
    const options = this.getOptions(queryParams);
    return this.http.post(this.baseURL + url, body, options)
  }

  signIn(body: any): Observable<any> {
    let signInSubject = new Subject();
    this.http.post(this.baseURL + 'signin', body).subscribe(response => {
      this.addAuth(response);
      signInSubject.next(response);
    })
    return signInSubject;
  }

  signUp(body: any): Observable<any> {
    let signUpSubject = new Subject();
    this.http.post(this.baseURL + 'signup', body).subscribe(response => {
      this.addAuth(response);
      signUpSubject.next(response);
    })
    return signUpSubject;
  }

  addAuth(response) {
    if (response && response.hasOwnProperty('token')) {
      if (this.headers.has('Authorization'))
        this.headers.delete('Authorization');
      this.headers = this.headers.set('Authorization', 'Bearer ' + response['token']);
      this.sessionStorage.set(Constants.AUTH_TOKEN, response['token']);
      delete response['token'];
    }
  }

  getOptions(queryParams) {
    let params: HttpParams;
    if (queryParams)
      queryParams.forEach(param => {
        params.set(param.key, param.value);
      });
    if (!this.headers.has('Authorization') && this.sessionStorage.get(Constants.AUTH_TOKEN))
      this.headers = this.headers.set('Authorization', 'Bearer ' + this.sessionStorage.get(Constants.AUTH_TOKEN));
    return { headers: this.headers, params };
  }
}
