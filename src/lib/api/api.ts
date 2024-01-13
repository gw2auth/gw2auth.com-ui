import { PropertyFilterProps } from '@cloudscape-design/components';
import { HTTPClient } from '../http';
import { OAuth2ParamNames, OAuth2Params } from '../oauth2.model';
import {
  isJsonObject, JsonType,
  ApiErrorBody,
  ApiToken,
  Application,
  ApplicationListItem,
  ApprovalStatus,
  AuthInfo,
  DevApplication,
  DevApplicationApiKeyCreation,
  DevApplicationClient,
  DevApplicationClientCreation,
  DevApplicationCreation,
  DevApplicationListItem,
  DevApplicationUser,
  DevApplicationUserUpdate,
  Gw2Account,
  Gw2AccountListItem,
  OAuth2ConsentInfo,
  OAuth2TokenResponse,
  PagedResponse,
  VerificationStart,
  VerificationSubmit, VerificationPendingChallenge, VerificationStartedChallenge, Account, ApplicationSummary,
} from './api.model';

const KindSuccess = 0;
const KindApiError = 1;
const KindError = 2;

interface SimpleHeaders {
  get(name: string): string | null;
  has(name: string): boolean;
}

interface BaseResponse<T> {
  kind: typeof KindSuccess | typeof KindApiError | typeof KindError;
  status: number;
  headers: SimpleHeaders;
  body?: T;
  error?: ApiErrorBody | Error;
}

export interface SuccessResponse<T> extends BaseResponse<T> {
  kind: typeof KindSuccess,
  body: T;
  error: undefined;
}

export interface ApiErrorResponse<T> extends BaseResponse<T> {
  kind: typeof KindApiError;
  body: undefined;
  error: ApiErrorBody;
}

export interface ErrorResponse<T> extends BaseResponse<T> {
  kind: typeof KindError;
  body: undefined;
  error: Error;
}

export type ApiResponse<T> = SuccessResponse<T> | ApiErrorResponse<T> | ErrorResponse<T>;

export class ApiClient {
  constructor(private readonly httpClient: HTTPClient) {}

  getApplicationSummary(): Promise<ApiResponse<ApplicationSummary>> {
    return transform(this.httpClient.fetch('/api-v2/application/summary'));
  }

  getAuthInfo(): Promise<ApiResponse<AuthInfo>> {
    return transform(this.httpClient.fetch('/api-v2/authinfo'));
  }

  getAccount(): Promise<ApiResponse<Account>> {
    return transform(this.httpClient.fetch('/api-v2/account'));
  }

  deleteAccount(): Promise<ApiResponse<true>> {
    return transform(
      this.httpClient.fetch('/api-v2/account', { method: 'DELETE' }),
      () => true,
    );
  }

  deleteAccountFederation(issuer: string, idAtIssuer: string): Promise<ApiResponse<true>> {
    const params = new URLSearchParams();
    params.set('issuer', issuer);
    params.set('idAtIssuer', idAtIssuer);

    return transform(
      this.httpClient.fetch(`/api-v2/account/federation?${params.toString()}`, { method: 'DELETE' }),
      () => true,
    );
  }

  deleteAccountFederationSession(id: string): Promise<ApiResponse<true>> {
    const params = new URLSearchParams();
    params.set('id', id);

    return transform(
      this.httpClient.fetch(`/api-v2/account/session?${params.toString()}`, { method: 'DELETE' }),
      () => true,
    );
  }

  getGw2Accounts(): Promise<ApiResponse<Array<Gw2AccountListItem>>> {
    return transform(this.httpClient.fetch('/api-v2/gw2account'));
  }

  getGw2Account(id: string): Promise<ApiResponse<Gw2Account>> {
    return transform(this.httpClient.fetch(`/api-v2/gw2account/${encodeURIComponent(id)}`));
  }

  updateGw2Account(id: string, displayName: string): Promise<ApiResponse<unknown>> {
    return transform(this.httpClient.fetch(
      `/api-v2/gw2account/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ displayName: displayName }),
      },
    ));
  }

  addApiToken(expectGw2AccountId: string | null, apiToken: string): Promise<ApiResponse<ApiToken>> {
    let url = '/api-v2/gw2apitoken';
    if (expectGw2AccountId !== null) {
      url += `/${encodeURIComponent(expectGw2AccountId)}`;
    }

    return transform(this.httpClient.fetch(
      url,
      {
        method: 'PUT',
        body: JSON.stringify({ apiToken: apiToken }),
      },
    ));
  }

  updateApiToken(expectGw2AccountId: string, apiToken: string): Promise<ApiResponse<ApiToken>> {
    return transform(this.httpClient.fetch(
      `/api-v2/gw2apitoken/${encodeURIComponent(expectGw2AccountId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ apiToken: apiToken }),
      },
    ));
  }

  deleteApiToken(gw2AccountId: string): Promise<ApiResponse<unknown>> {
    return transform(this.httpClient.fetch(
      `/api-v2/gw2apitoken/${encodeURIComponent(gw2AccountId)}`,
      { method: 'DELETE' },
    ));
  }
  
  getApplications(): Promise<ApiResponse<Array<ApplicationListItem>>> {
    return transform(this.httpClient.fetch('/api-v2/application'));
  }

  getApplication(id: string): Promise<ApiResponse<Application>> {
    return transform(this.httpClient.fetch(`/api-v2/application/${encodeURIComponent(id)}`));
  }

  revokeApplicationAccess(id: string): Promise<ApiResponse<unknown>> {
    return transform(this.httpClient.fetch(`/api-v2/application/${encodeURIComponent(id)}`, { method: 'DELETE' }));
  }

  getDevApplications(): Promise<ApiResponse<Array<DevApplicationListItem>>> {
    return transform(this.httpClient.fetch('/api-v2/dev/application'));
  }

  createDevApplication(displayName: string): Promise<ApiResponse<DevApplicationCreation>> {
    return transform(this.httpClient.fetch(
      '/api-v2/dev/application',
      {
        method: 'PUT',
        body: JSON.stringify({ displayName: displayName }),
      },
    ));
  }

  deleteDevApplication(id: string): Promise<ApiResponse<unknown>> {
    return transform(this.httpClient.fetch(`/api-v2/dev/application/${encodeURIComponent(id)}`, { method: 'DELETE' }));
  }

  getDevApplication(id: string): Promise<ApiResponse<DevApplication>> {
    return transform(this.httpClient.fetch(`/api-v2/dev/application/${encodeURIComponent(id)}`));
  }

  getDevApplicationUsers(id: string, query: PropertyFilterProps.Query | undefined, nextToken: string | undefined): Promise<ApiResponse<PagedResponse<DevApplicationUser>>> {
    let url = `/api-v2/dev/application/${encodeURIComponent(id)}/user`;

    const searchParams = new URLSearchParams();
    if (query !== undefined && query.tokens.length > 0) {
      searchParams.set('query', JSON.stringify(query));
    }

    if (nextToken !== undefined) {
      searchParams.set('nextToken', nextToken);
    }

    if (searchParams.size > 0) {
      url += `?${searchParams.toString()}`;
    }

    return transform(this.httpClient.fetch(url));
  }

  updateDevApplicationUserApproval(appId: string, clientId: string, userId: string, approvalStatus: ApprovalStatus): Promise<ApiResponse<DevApplicationUserUpdate>> {
    return transform(this.httpClient.fetch(
      `/api-v2/dev/application/${encodeURIComponent(appId)}/client/${encodeURIComponent(clientId)}/user/${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ approvalStatus: approvalStatus, approvalMessage: 'Updated by Admin' } satisfies DevApplicationUserUpdate),
      },
    ));
  }

  createDevApplicationClient(appId: string, displayName: string, redirectURIs: ReadonlyArray<string>, requiresAppproval: boolean): Promise<ApiResponse<DevApplicationClientCreation>> {
    return transform(this.httpClient.fetch(
      `/api-v2/dev/application/${encodeURIComponent(appId)}/client`,
      {
        method: 'PUT',
        body: JSON.stringify({
          displayName: displayName,
          redirectURIs: redirectURIs,
          requiresApproval: requiresAppproval,
        }),
      },
    ));
  }

  deleteDevApplicationClient(appId: string, clientId: string): Promise<ApiResponse<unknown>> {
    return transform(this.httpClient.fetch(`/api-v2/dev/application/${encodeURIComponent(appId)}/client/${encodeURIComponent(clientId)}`, { method: 'DELETE' }));
  }

  getDevApplicationClient(appId: string, clientId: string): Promise<ApiResponse<DevApplicationClient>> {
    return transform(this.httpClient.fetch(`/api-v2/dev/application/${encodeURIComponent(appId)}/client/${encodeURIComponent(clientId)}`));
  }

  regenerateDevApplicationClientSecret(appId: string, clientId: string): Promise<ApiResponse<{ clientSecret: string }>> {
    return transform(this.httpClient.fetch(
      `/api-v2/dev/application/${encodeURIComponent(appId)}/client/${encodeURIComponent(clientId)}/secret`,
      { method: 'POST' },
    ));
  }

  updateDevApplicationClientRedirectURIs(appId: string, clientId: string, redirectURIs: ReadonlyArray<string>): Promise<ApiResponse<boolean>> {
    return transform(this.httpClient.fetch(
      `/api-v2/dev/application/${encodeURIComponent(appId)}/client/${encodeURIComponent(clientId)}/redirecturi`,
      {
        method: 'PUT',
        body: JSON.stringify(redirectURIs),
      },
    ), (status) => status === 200, 200, 304);
  }

  createDevApplicationApiKey(appId: string, permissions: ReadonlyArray<string>, expiresAt?: string): Promise<ApiResponse<DevApplicationApiKeyCreation>> {
    return transform(this.httpClient.fetch(
      `/api-v2/dev/application/${encodeURIComponent(appId)}/apikey`,
      {
        method: 'PUT',
        body: JSON.stringify({
          permissions: permissions,
          expiresAt: expiresAt,
        }),
      },
    ));
  }

  deleteDevApplicationApiKey(appId: string, keyId: string): Promise<ApiResponse<unknown>> {
    return transform(this.httpClient.fetch(`/api-v2/dev/application/${encodeURIComponent(appId)}/apikey/${encodeURIComponent(keyId)}`, { method: 'DELETE' }));
  }
  
  getConsentInfo(clientId: string, state: string, scope: string): Promise<ApiResponse<OAuth2ConsentInfo>> {
    const params = new URLSearchParams();
    params.set(OAuth2ParamNames.CLIENT_ID, clientId);
    params.set(OAuth2ParamNames.STATE, state);
    params.set(OAuth2ParamNames.SCOPE, scope);

    return transform(this.httpClient.fetch(`/api/oauth2/consent?${params.toString()}`));
  }

  retrieveTokenByCode(clientId: string, clientSecret: string, code: string, redirectURI: string, codeVerifier?: string): Promise<ApiResponse<OAuth2TokenResponse>> {
    const params = new URLSearchParams();
    params.set(OAuth2ParamNames.CLIENT_ID, clientId);
    params.set(OAuth2ParamNames.CLIENT_SECRET, clientSecret);
    params.set(OAuth2ParamNames.GRANT_TYPE, OAuth2Params.GrantType.AUTHORIZATION_CODE);
    params.set(OAuth2ParamNames.CODE, code);
    params.set(OAuth2ParamNames.REDIRECT_URI, redirectURI);

    if (codeVerifier !== undefined) {
      params.set(OAuth2ParamNames.CODE_VERIFIER, codeVerifier);
    }

    return transform(this.httpClient.fetch(
      '/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    ));
  }

  retrieveTokenByRefreshToken(clientId: string, clientSecret: string, refreshToken: string): Promise<ApiResponse<OAuth2TokenResponse>> {
    const params = new URLSearchParams();
    params.set(OAuth2ParamNames.CLIENT_ID, clientId);
    params.set(OAuth2ParamNames.CLIENT_SECRET, clientSecret);
    params.set(OAuth2ParamNames.GRANT_TYPE, OAuth2Params.GrantType.REFRESH_TOKEN);
    params.set(OAuth2ParamNames.REFRESH_TOKEN, refreshToken);

    return transform(this.httpClient.fetch(
      '/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    ));
  }

  getVerificationActiveChallenge(): Promise<ApiResponse<VerificationStartedChallenge | null>> {
    return transform(
      this.httpClient.fetch('/api-v2/verification/active'),
      (status, body) => {
        if (status === 404) {
          return null;
        }

        return JSON.parse(body) as VerificationStartedChallenge;
      },
      200,
      404,
    );
  }

  getVerificationPendingChallenges(): Promise<ApiResponse<ReadonlyArray<VerificationPendingChallenge>>> {
    return transform(this.httpClient.fetch('/api-v2/verification/pending'));
  }

  startVerificationChallenge(challengeId: number): Promise<ApiResponse<VerificationStart>> {
    const params = new URLSearchParams();
    params.set('challengeId', challengeId.toString());

    return transform(this.httpClient.fetch(`/api/verification?${params.toString()}`, { method: 'POST' }));
  }

  submitVerificationChallenge(token: string): Promise<ApiResponse<VerificationSubmit>> {
    const params = new URLSearchParams();
    params.set('token', token);

    return transform(this.httpClient.fetch(`/api/verification/pending?${params.toString()}`, { method: 'POST' }));
  }

  cancelPendingChallenge(gw2AccountId: string): Promise<ApiResponse<boolean>> {
    return transform(
      this.httpClient.fetch(`/api/verification/pending/${encodeURIComponent(gw2AccountId)}`, { method: 'DELETE' }),
      (status) => status === 200,
    );
  }

  logout(): Promise<ApiResponse<unknown>> {
    return transform(this.httpClient.fetch('/auth/logout', { method: 'POST' }));
  }
}

async function transform<T>(resPromise: Promise<Response>, parseFn: (status: number, body: string) => T = (_, body) => JSON.parse(body) as T, successCode = 200, ...successCodes: Array<number>): Promise<ApiResponse<T>> {
  let status = 999;
  let headers = EMPTY_HEADERS;
  let bodyRaw = '';
  let errorCause: unknown;
  try {
    const res = await resPromise;
    status = res.status;
    headers = new ResponseHeaders(res.headers);
    bodyRaw = await res.text();
    // res.headers

    if (status === successCode || successCodes.includes(status)) {
      return {
        kind: KindSuccess,
        status: status,
        headers: headers,
        body: parseFn(status, bodyRaw),
        error: undefined,
      };
    }

    const body = JSON.parse(bodyRaw) as JsonType;
    if (isJsonObject(body) && typeof body.message === 'string') {
      return {
        kind: KindApiError,
        status: status,
        headers: headers,
        body: undefined,
        error: {
          message: body.message,
        },
      };
    }
  } catch (e) {
    errorCause = e;
    if (e instanceof Error) {
      return {
        kind: KindError,
        status: status,
        headers: headers,
        body: undefined,
        error: e,
      };
    }
  }

  return {
    kind: KindError,
    status: status,
    headers: headers,
    body: undefined,
    error: new Error(`unknown error: ${bodyRaw}`, { cause: errorCause }),
  };
}

export class ApiError extends Error {
  constructor(public readonly response: ApiErrorResponse<unknown> | ErrorResponse<unknown>) {
    let message: string;
    let cause: unknown;
    if (response.kind === 1) {
      message = response.error.message;
    } else {
      message = 'unknown error';
      cause = response.error;
    }

    super(message, { cause: cause });
  }
}

export function expectSuccess<T>(resp: ApiResponse<T>): SuccessResponse<T> {
  if (resp.error !== undefined) {
    throw new ApiError(resp);
  }

  return resp;
}

const EMPTY_HEADERS = {
  get(_: string): string | null {
    return null;
  },
  has(_: string): boolean {
    return false;
  },
} satisfies SimpleHeaders;

class ResponseHeaders implements SimpleHeaders {
  constructor(private readonly headers: Headers) {
  }

  get(name: string): string | null {
    return this.headers.get(name);
  }

  has(name: string): boolean {
    return this.headers.has(name);
  }
}
