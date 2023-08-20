import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
  ClientRegistrationPrivateNew
} from './client-registration.model';
import {ClientRegistrationService} from './client-registration.service';
import {Gw2ApiPermission} from '../../../common/common.model';
import {DOCUMENT} from "@angular/common";


@Component({
  selector: 'app-client-debug',
  templateUrl: './client-debug.component.html'
})
export class ClientDebugComponent implements OnInit {

  clientRegistration: ClientRegistrationPrivateNew | null = null;

  gw2ApiPermissions: Gw2ApiPermission[] = Object.values(Gw2ApiPermission);
  selectedGw2ApiPermissions = new Set<Gw2ApiPermission>();
  forceConsentPrompt = true;
  requestId = true;
  requestName = true;
  requestDisplayName = true;
  requestVerifiedInformation = true;
  authorizationName = '';

  constructor(private readonly clientRegistrationService: ClientRegistrationService, private readonly activatedRoute: ActivatedRoute, @Inject(DOCUMENT) private readonly document: Document) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const clientId = params.get('clientId');

      this.clientRegistration = null;

      if (clientId != null) {
        this.clientRegistrationService.getClientRegistration(clientId)
          .then((clientRegistration) => {
            this.clientRegistration = clientRegistration;
          });
      }
    });
  }

  onGw2ApiPermissionClick(gw2ApiPermission: Gw2ApiPermission): void {
    if (this.selectedGw2ApiPermissions.has(gw2ApiPermission)) {
      this.selectedGw2ApiPermissions.delete(gw2ApiPermission);
    } else {
      this.selectedGw2ApiPermissions.add(gw2ApiPermission);
    }
  }

  getTestAuthorizeUri(clientRegistration: ClientRegistrationPrivateNew): string {
    let correctRedirectUri = '';
    for (let redirectUri of clientRegistration.redirectUris) {
      if (redirectUri.startsWith(this.document.location.origin) && redirectUri.endsWith('/account/client/debug')) {
        correctRedirectUri = redirectUri;
        break;
      }
    }

    const scopes = [];
    for (let gw2ApiPermission of this.selectedGw2ApiPermissions) {
      scopes.push('gw2:' + gw2ApiPermission);
    }

    if (clientRegistration.apiVersion === 0) {
      if (this.requestVerifiedInformation) {
        scopes.push('gw2auth:verified');
      }
    } else if (clientRegistration.apiVersion === 1) {
      if (this.requestId) {
        scopes.push('id');
      }

      if (this.requestName) {
        scopes.push('gw2acc:name');
      }

      if (this.requestDisplayName) {
        scopes.push('gw2acc:display_name');
      }

      if (this.requestVerifiedInformation) {
        scopes.push('gw2acc:verified');
      }
    }

    const query = new URLSearchParams();
    query.set('response_type', 'code');
    query.set('client_id', clientRegistration.clientId);
    query.set('scope', scopes.join(' '));
    query.set('redirect_uri', correctRedirectUri);
    query.set('state', clientRegistration.clientId);

    if (this.forceConsentPrompt) {
      query.set('prompt', 'consent');
    }

    if (this.authorizationName.length > 0) {
      query.set('name', this.authorizationName);
    }

    return '/oauth2/authorize?' + query.toString();
  }
}
