import { Component, OnInit } from '@angular/core';
import {ClientRegistrationService} from './client-registration.service';
import {
  AuthorizationGrantType,
  authorizationGrantTypeDisplayName,
  ClientRegistrationPrivateNew
} from './client-registration.model';
import {ToastService} from '../../../toast/toast.service';
import {ApiError} from '../../../common/common.model';

@Component({
  selector: 'app-client-create',
  templateUrl: './client-create.component.html'
})
export class ClientCreateComponent implements OnInit {

  displayName = '';
  authorizationGrantTypes: AuthorizationGrantType[] = Object.values(AuthorizationGrantType);
  redirectUri = '';

  createInProgress = false;
  showCreateButton = true;

  apiVersion: number | null = null;
  creationTime: Date | null = null;
  clientId: string | null = null;
  clientSecret: string | null = null;

  constructor(private readonly clientRegistrationService: ClientRegistrationService, private readonly toastService: ToastService) { }

  ngOnInit(): void {
  }

  authorizationGrantTypeDisplayName(authorizationGrantType: AuthorizationGrantType): string {
      return authorizationGrantTypeDisplayName(authorizationGrantType);
  }

  onCreateClientClick(): void {
    this.createInProgress = true;

    this.clientRegistrationService.createClientRegistration({displayName: this.displayName, authorizationGrantTypes: this.authorizationGrantTypes, redirectUris: [this.redirectUri]})
        .then((response) => {
            this.showCreateButton = false;

            if ((<ClientRegistrationPrivateNew> response.clientRegistration).apiVersion !== undefined) {
              this.apiVersion = (<ClientRegistrationPrivateNew> response.clientRegistration).apiVersion;
            } else {
              this.apiVersion = 0;
            }

            this.displayName = response.clientRegistration.displayName;
            this.authorizationGrantTypes = response.clientRegistration.authorizationGrantTypes;
            this.redirectUri = response.clientRegistration.redirectUris.join(',');
            this.creationTime = response.clientRegistration.creationTime;
            this.clientId = response.clientRegistration.clientId;
            this.clientSecret = response.clientSecret;
        })
        .catch((apiError: ApiError) => {
            this.toastService.show('Failed to create client', 'The client could not be created: ' + apiError.message);
        })
        .finally(() => {
            this.createInProgress = false;
        });
  }
}
