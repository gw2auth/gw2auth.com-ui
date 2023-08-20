import {ClientRegistrationPublicOld, ClientRegistrationPublicNew} from '../client/client-registration.model';
import {Gw2ApiPermission} from '../../../common/common.model';

export type ClientConsent = ClientConsentOld | ClientConsentNew;

export interface ClientConsentOld {
    clientRegistration: ClientRegistrationPublicOld;
    accountSub: string;
    authorizedGw2ApiPermissions: Gw2ApiPermission[];
    authorizedVerifiedInformation: boolean;
}

export interface ClientConsentNew {
    clientRegistration: ClientRegistrationPublicNew;
    accountSub: string;
    authorizedScopes: string[];
}