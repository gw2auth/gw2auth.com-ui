import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import {
  ClientRegistrationCreation, ClientRegistrationCreationNew,
  ClientRegistrationCreationRequest,
  ClientRegistrationPrivate, ClientRegistrationPrivateNew, ClientRegistrationPrivateOld,
  ClientRegistrationPrivateSummary
} from './client-registration.model';

@Injectable()
export class ClientRegistrationService {

  constructor(private readonly http: HttpClient) { }

  async getClientRegistrations(): Promise<ClientRegistrationPrivateNew[]> {
    const response = await firstValueFrom(this.http.get<ClientRegistrationPrivate[]>('/api/client/registration'));
    return response.map((v) => this.convertClientRegistrationPrivate(v));
  }

  async getClientRegistration(clientId: string): Promise<ClientRegistrationPrivateNew> {
    const response = await firstValueFrom(this.http.get<ClientRegistrationPrivate>('/api/client/registration/' + encodeURIComponent(clientId)));
    return this.convertClientRegistrationPrivate(response);
  }

  async getClientRegistrationSummary(clientId: string): Promise<ClientRegistrationPrivateSummary> {
    return await firstValueFrom(this.http.get<ClientRegistrationPrivateSummary>('/api/client/registration/' + encodeURIComponent(clientId) + '/summary'));
  }

  async createClientRegistration(request: ClientRegistrationCreationRequest): Promise<ClientRegistrationCreationNew> {
    const response = await firstValueFrom(this.http.post<ClientRegistrationCreation>('/api/client/registration', request));
    return {
      clientRegistration: this.convertClientRegistrationPrivate(response.clientRegistration),
      clientSecret: response.clientSecret,
    };
  }

  async addRedirectUri(clientId: string, redirectUri: string): Promise<ClientRegistrationPrivateNew> {
    const response = await firstValueFrom(this.http.put<ClientRegistrationPrivate>('/api/client/registration/' + encodeURIComponent(clientId) + '/redirect-uris', redirectUri));
    return this.convertClientRegistrationPrivate(response);
  }

  async removeRedirectUri(clientId: string, redirectUri: string): Promise<ClientRegistrationPrivateNew> {
    const response = await firstValueFrom(this.http.delete<ClientRegistrationPrivate>('/api/client/registration/' + encodeURIComponent(clientId) + '/redirect-uris', { params: { redirectUri: redirectUri } }));
    return this.convertClientRegistrationPrivate(response);
  }

  async regenerateClientSecret(clientId: string): Promise<ClientRegistrationCreation> {
    const response = await firstValueFrom(this.http.patch<ClientRegistrationCreation>('/api/client/registration/' + encodeURIComponent(clientId) + '/client-secret', null));
    return {
      clientRegistration: this.convertClientRegistrationPrivate(response.clientRegistration),
      clientSecret: response.clientSecret,
    };
  }

  deleteClientRegistration(clientId: string): Observable<void> {
    return this.http.delete<void>('/api/client/registration/' + encodeURIComponent(clientId));
  }

  private convertClientRegistrationPrivate(clientRegistration: ClientRegistrationPrivate): ClientRegistrationPrivateNew {
    if ((<ClientRegistrationPrivateNew> clientRegistration).apiVersion !== undefined) {
      return <ClientRegistrationPrivateNew> clientRegistration;
    } else {
      const clientRegistrationOld = <ClientRegistrationPrivateOld> clientRegistration;
      return {
        apiVersion: 0,
        authorizationGrantTypes: clientRegistrationOld.authorizationGrantTypes,
        clientId: clientRegistrationOld.clientId,
        creationTime: clientRegistrationOld.creationTime,
        displayName: clientRegistrationOld.displayName,
        redirectUris: clientRegistrationOld.redirectUris,
      };
    }
  }
}
