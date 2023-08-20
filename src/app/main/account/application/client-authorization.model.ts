import {Gw2ApiPermission} from '../../../common/common.model';

export interface Token {
    gw2AccountId: string;
    displayName: string;
}

export type ClientAuthorization = ClientAuthorizationOld | ClientAuthorizationNew;

export interface ClientAuthorizationOld {
    id: string;
    creationTime: Date;
    lastUpdateTime: Date;
    displayName: string;
    authorizedGw2ApiPermissions: Gw2ApiPermission[];
    authorizedVerifiedInformation: boolean;
    tokens: Token[];
}

export interface ClientAuthorizationNew {
    id: string;
    creationTime: Date;
    lastUpdateTime: Date;
    displayName: string;
    authorizedScopes: string[];
    tokens: Token[];
}