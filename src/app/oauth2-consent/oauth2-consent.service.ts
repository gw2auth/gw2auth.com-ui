import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {Params} from '@angular/router';
import { ClientRegistrationPublicNew, ClientRegistrationPublicOld } from '../main/account/client/client-registration.model';
import {Gw2ApiPermission} from '../common/common.model';


@Injectable()
export class OAuth2ConsentService {

    constructor(private readonly http: HttpClient) {
    }

    async getOAuth2ConsentInformation(params: Params): Promise<OAuth2ConsentInformationNew> {
        const response = await firstValueFrom(this.http.get<OAuth2ConsentInformation>('/api/oauth2/consent', {params: params}));

        if ((<OAuth2ConsentInformationNew> response).requestedScopes) {
            return <OAuth2ConsentInformationNew> response;
        } else {
            const oauth2ConsentInformationOld = <OAuth2ConsentInformationOld> response;
            const requestedScopes: string[] = [];

            for (let requestedGw2ApiPermission of oauth2ConsentInformationOld.requestedGw2ApiPermissions) {
                requestedScopes.push('gw2:' + requestedGw2ApiPermission);
            }

            if (oauth2ConsentInformationOld.requestedVerifiedInformation) {
                requestedScopes.push('gw2auth:verified');
            }

            return {
                apiTokensWithInsufficientPermissions: oauth2ConsentInformationOld.apiTokensWithInsufficientPermissions,
                apiTokensWithSufficientPermissions: oauth2ConsentInformationOld.apiTokensWithSufficientPermissions,
                cancelUri: oauth2ConsentInformationOld.cancelUri,
                clientRegistration: {
                    creationTime: oauth2ConsentInformationOld.clientRegistration.creationTime,
                    displayName: oauth2ConsentInformationOld.clientRegistration.displayName,
                    clientId: oauth2ConsentInformationOld.clientRegistration.clientId,
                    apiVersion: 0,
                },
                previouslyConsentedGw2AccountIds: oauth2ConsentInformationOld.previouslyConsentedGw2AccountIds,
                requestedScopes: requestedScopes,
                submitFormParameters: oauth2ConsentInformationOld.submitFormParameters,
                submitFormUri: oauth2ConsentInformationOld.submitFormUri,
                containsAnyGw2AccountRelatedScopes: true,
            };
        }
    }
}

export interface MinimalToken {
    gw2AccountId: string;
    gw2ApiToken: string;
    displayName: string;
    isValid: boolean;
    isVerified: boolean;
}

export type OAuth2ConsentInformation = OAuth2ConsentInformationOld | OAuth2ConsentInformationNew;

export interface OAuth2ConsentInformationOld {
    clientRegistration: ClientRegistrationPublicOld;
    requestedGw2ApiPermissions: Gw2ApiPermission[];
    requestedVerifiedInformation: boolean;
    submitFormUri: string;
    submitFormParameters: Map<string, string[]>;
    cancelUri: string;
    apiTokensWithSufficientPermissions: MinimalToken[];
    apiTokensWithInsufficientPermissions: MinimalToken[];
    previouslyConsentedGw2AccountIds: string[];
}

export interface OAuth2ConsentInformationNew {
    clientRegistration: ClientRegistrationPublicNew;
    requestedScopes: string[];
    submitFormUri: string;
    submitFormParameters: Map<string, string[]>;
    cancelUri: string;
    apiTokensWithSufficientPermissions: MinimalToken[];
    apiTokensWithInsufficientPermissions: MinimalToken[];
    previouslyConsentedGw2AccountIds: string[];
    containsAnyGw2AccountRelatedScopes: boolean;
}