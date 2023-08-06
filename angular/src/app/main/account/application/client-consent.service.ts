import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ClientConsent} from './client-consent.model';

@Injectable()
export class ClientConsentService {

    constructor(private readonly http: HttpClient) {
    }

    getClientConsents(): Observable<ClientConsent[]> {
        return this.http.get<ClientConsent[]>('/api/client/consent');
    }

    deleteClientConsent(clientId: string): Observable<void> {
        return this.http.delete<void>('/api/client/consent/' + encodeURIComponent(clientId));
    }
}