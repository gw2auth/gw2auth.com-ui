import {ClientRegistrationPublic} from '../client/client-registration.model';
import {Gw2ApiPermission} from '../../../common/common.model';

export interface ClientConsent {
    clientRegistration: ClientRegistrationPublic;
    accountSub: string;
    authorizedGw2ApiPermissions: Gw2ApiPermission[];
    authorizedVerifiedInformation: boolean;
}
