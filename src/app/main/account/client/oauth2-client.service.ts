import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';


export type GrantType = 'authorization_code' | 'refresh_token';

@Injectable()
export class Oauth2ClientService {

    constructor(private readonly httpClient: HttpClient, @Inject(DOCUMENT) private readonly document: Document) {}

    getToken(grantType: GrantType, codeOrRefreshToken: string, clientId: string, clientSecret: string, redirectUri: string | null): Observable<HttpResponse<string> | HttpErrorResponse> {
        const formData = new URLSearchParams();
        formData.set('grant_type', grantType);
        formData.set('client_id', clientId);
        formData.set('client_secret', clientSecret);

        switch (grantType) {
            case 'authorization_code': {
                formData.set('code', codeOrRefreshToken);
                formData.set('redirect_uri', redirectUri!);
                break;
            }
            case 'refresh_token': {
                formData.set('refresh_token', codeOrRefreshToken);
                break;
            }
        }

        return this.httpClient.post<string>(
            '/oauth2/token',
            formData,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, observe: 'response', responseType: 'text' as 'json'}
        ).pipe(catchError((e) => of(e as HttpErrorResponse)));
    }
}