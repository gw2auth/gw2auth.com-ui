import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard  {

  constructor(private readonly authService: AuthService, private readonly router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated(false).pipe(map((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        return true;
      }

      return this.router.parseUrl('/');
    }));
  }
}
