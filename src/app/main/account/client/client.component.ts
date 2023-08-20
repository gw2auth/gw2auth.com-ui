import {Component, Inject, OnInit} from '@angular/core';
import {ClientRegistrationService} from './client-registration.service';
import {
  AuthorizationGrantType,
  ClientRegistrationPrivateSummary,
  authorizationGrantTypeDisplayName,
  ClientRegistrationPrivateNew,
} from './client-registration.model';
import {faAngleDoubleDown, faTrashAlt, faCopy, faRedo, faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {DeleteModalComponent} from '../../../general/delete-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastService} from '../../../toast/toast.service';
import {ApiError} from '../../../common/common.model';
import {DOCUMENT} from '@angular/common';
import {firstValueFrom} from 'rxjs';
import {RegenerateClientSecretModalComponent} from './regenerate-client-secret-modal.component';


@Component({
  selector: 'app-client',
  templateUrl: './client.component.html'
})
export class ClientComponent implements OnInit {

  faAngleDoubleDown = faAngleDoubleDown;
  faTrashAlt = faTrashAlt;
  faCopy = faCopy;
  faRedo = faRedo;
  faPlusSquare = faPlusSquare;

  clientRegistrations: ClientRegistrationPrivateNew[] = [];
  clientSecretsByClientId = new Map<string, string>();
  clientRegistrationSummaryByClientId = new Map<string, ClientRegistrationPrivateSummary>();
  clientRegistrationSummaryLoadingByClientId = new Map<string, boolean>();

  constructor(private readonly clientRegistrationService: ClientRegistrationService,
              private readonly modalService: NgbModal,
              private readonly toastService: ToastService,
              @Inject(DOCUMENT) private readonly document: Document) { }

  ngOnInit(): void {
    this.clientRegistrationService.getClientRegistrations().then((clientRegistrations) => {
      this.clientRegistrations = clientRegistrations;
    });
  }

  authorizationGrantTypeDisplayName(authorizationGrantType: AuthorizationGrantType): string {
    return authorizationGrantTypeDisplayName(authorizationGrantType);
  }

  hasTestRedirectUri(clientRegistration: ClientRegistrationPrivateNew): boolean {
      for (let redirectUri of clientRegistration.redirectUris) {
          if (redirectUri.startsWith(this.document.location.origin) && redirectUri.endsWith('/account/client/debug')) {
              return true;
          }
      }

      return false;
  }

  getClientSecretSafe(clientRegistration: ClientRegistrationPrivateNew): string {
      const clientSecret = this.clientSecretsByClientId.get(clientRegistration.clientId);
      if (clientSecret != undefined) {
          return clientSecret;
      } else {
          return '';
      }
  }

  onCopyClick(tooltip: any, value: string): void {
      navigator.clipboard.writeText(value)
          .then(() => tooltip.open({message: 'Copied!'}))
          .catch(() => tooltip.open({message: 'Copy failed'}));
  }

  onAddRedirectUriClick(clientRegistration: ClientRegistrationPrivateNew, redirectUriElement: HTMLInputElement): void {
      this.clientRegistrationService.addRedirectUri(clientRegistration.clientId, redirectUriElement.value)
          .then((clientRegistration) => {
              this.toastService.show('Redirect URI added', 'The redirect URI has been added successfully');

              for (let i = 0; i < this.clientRegistrations.length; i++) {
                  if (this.clientRegistrations[i].clientId == clientRegistration.clientId) {
                      this.clientRegistrations[i] = clientRegistration;
                      break;
                  }
              }

              redirectUriElement.value = '';
          })
          .catch((apiError: ApiError) => {
              this.toastService.show('Redirect URI addition failed', 'The redirect URI addition failed: ' + apiError.message);
          });
  }

  onLoadSummaryClick(clientRegistration: ClientRegistrationPrivateNew): void {
      const clientId = clientRegistration.clientId;

      this.clientRegistrationSummaryLoadingByClientId.set(clientId, true);

      this.clientRegistrationService.getClientRegistrationSummary(clientId)
          .then((clientRegistrationSummary) => {
              this.clientRegistrationSummaryByClientId.set(clientId, clientRegistrationSummary);
          })
          .catch((apiError: ApiError) => {
              this.toastService.show('Loading summary failed', 'Failed to load client summary: ' + apiError.message);
          })
          .finally(() => {
              this.clientRegistrationSummaryLoadingByClientId.delete(clientId);
          });
  }

  trackByClientRegistration(idx: number, clientRegistration: ClientRegistrationPrivateNew): string {
      return clientRegistration.clientId;
  }

  openRegenerateClientSecretModal(clientRegistration: ClientRegistrationPrivateNew): void {
      const modalRef = this.modalService.open(RegenerateClientSecretModalComponent);
      modalRef.componentInstance.clientRegistration = clientRegistration;

      modalRef.result
          .then((confirmed: boolean) => {
              if (confirmed) {
                  this.clientRegistrationService.regenerateClientSecret(clientRegistration.clientId)
                      .then((clientRegistrationCreation) => {
                          this.toastService.show('Client Secret generated', 'The client secret has been generated successfully');
                          this.clientSecretsByClientId.set(clientRegistrationCreation.clientRegistration.clientId, clientRegistrationCreation.clientSecret);
                      })
                      .catch((apiError: ApiError) => {
                          this.toastService.show('Client Secret generation failed', apiError.message);
                      });
              }
          })
          .catch(() => {});
  }

  openDeleteRedirectUriModal(clientRegistration: ClientRegistrationPrivateNew, redirectUri: string): void {
      const modalRef = this.modalService.open(DeleteModalComponent);
      modalRef.componentInstance.entityType = 'Redirect URI';
      modalRef.componentInstance.entityName = redirectUri;

      const clientId = clientRegistration.clientId;

      modalRef.result
          .then((confirmed: boolean) => {
              if (confirmed) {
                  this.clientRegistrationService.removeRedirectUri(clientId, redirectUri)
                      .then((clientRegistration) => {
                          this.toastService.show('Redirect URI deleted', 'The redirect URI has been deleted successfully');

                          this.clientRegistrations = this.clientRegistrations.map((v, index, arr) => {
                              if (v.clientId == clientId) {
                                  v = clientRegistration;
                              }

                              return v;
                          });
                      })
                      .catch((apiError: ApiError) => {
                          this.toastService.show('Redirect URI deletion failed', 'The redirect URI deletion failed: ' + apiError.message);
                      })
              }
          })
          .catch(() => {});
  }

  openDeleteClientModal(clientRegistration: ClientRegistrationPrivateNew): void {
    const modalRef = this.modalService.open(DeleteModalComponent);
    modalRef.componentInstance.entityType = 'Client';
    modalRef.componentInstance.entityName = clientRegistration.displayName;

    const clientId = clientRegistration.clientId;

    modalRef.result
        .then((confirmed: boolean) => {
            if (confirmed) {
                firstValueFrom(this.clientRegistrationService.deleteClientRegistration(clientId))
                    .then(() => {
                        this.toastService.show('Client deleted', 'The client has been deleted successfully');
                        this.clientRegistrations = this.clientRegistrations.filter((v: ClientRegistrationPrivateNew) => v.clientId != clientId);
                    })
                    .catch((apiError: ApiError) => {
                        this.toastService.show('Client deletion failed', 'The client deletion failed: ' + apiError.message);
                    })
            }
        })
        .catch(() => {});
  }
}
