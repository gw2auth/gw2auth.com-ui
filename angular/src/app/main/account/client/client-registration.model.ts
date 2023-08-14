export enum AuthorizationGrantType {
    AUTHORIZATION_CODE = 'authorization_code',
    REFRESH_TOKEN = 'refresh_token'
}

export function authorizationGrantTypeDisplayName(authorizationGrantType: AuthorizationGrantType): string {
    switch (authorizationGrantType) {
        case AuthorizationGrantType.AUTHORIZATION_CODE: return 'Authorization Code';
        case AuthorizationGrantType.REFRESH_TOKEN: return 'Refresh Token';
    }
}

export type ClientRegistrationPublic = ClientRegistrationPublicOld | ClientRegistrationPublicNew;

export interface ClientRegistrationPublicOld {
    creationTime: Date;
    displayName: string;
    clientId: string;
}

export interface ClientRegistrationPublicNew {
    creationTime: Date;
    displayName: string;
    clientId: string;
    apiVersion: number;
}

export type ClientRegistrationPrivate = ClientRegistrationPrivateOld | ClientRegistrationPrivateNew;

export interface ClientRegistrationPrivateOld {
    creationTime: Date;
    displayName: string;
    clientId: string;
    authorizationGrantTypes: AuthorizationGrantType[];
    redirectUris: string[];
}

export interface ClientRegistrationPrivateNew {
    creationTime: Date;
    displayName: string;
    clientId: string;
    authorizationGrantTypes: AuthorizationGrantType[];
    redirectUris: string[];
    apiVersion: number;
}

export interface ClientRegistrationPrivateSummary {
    accounts: number;
    gw2Accounts: number;
    authPast1d: number;
    authPast3d: number;
    authPast7d: number;
    authPast30d: number;
}

export type ClientRegistrationCreation = ClientRegistrationCreationOld | ClientRegistrationCreationNew;

export interface ClientRegistrationCreationOld {
    clientRegistration: ClientRegistrationPrivateOld;
    clientSecret: string;
}

export interface ClientRegistrationCreationNew {
    clientRegistration: ClientRegistrationPrivateNew;
    clientSecret: string;
}

export interface ClientRegistrationCreationRequest {
    displayName: string;
    authorizationGrantTypes: AuthorizationGrantType[];
    redirectUris: string[];
}