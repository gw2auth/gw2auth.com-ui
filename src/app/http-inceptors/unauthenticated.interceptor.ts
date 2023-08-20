import {Inject, Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';
import {AuthService} from '../auth.service';

@Injectable()
export class UnauthenticatedInterceptor implements HttpInterceptor {

  constructor(@Inject(DOCUMENT) private readonly document: Document, private readonly authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError((error) => {
      if (error.status == 401 || error.status == 403) {
        if ((error.path != null && this.shouldHandlePath(error.path)) || (error.url != null && this.shouldHandleURL(error.url))) {
          this.authService.logout('/login');
        }
      }

      return throwError(() => error);
    }));
  }

  private shouldHandleURL(url: string): boolean {
    let path: string | null = null;

    if (url.startsWith('/')) {
      path = url;
    } else if (url.startsWith(this.document.location.origin)) {
      path = url.substring(this.document.location.origin.length);
    }

    return path != null && this.shouldHandlePath(path);
  }

  private shouldHandlePath(path: string): boolean {
    return path.startsWith('/api') && !path.startsWith('/api/authinfo') && !path.startsWith('/api/oauth2/token');
  }
}
