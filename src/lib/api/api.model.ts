// eslint-disable-next-line
export interface JsonObject extends Record<string, JsonType> {}
export type JsonArray = ReadonlyArray<JsonType>;
export type JsonType = JsonObject | JsonArray | string | number | boolean | null;

export function isJsonObject(v: JsonType): v is JsonObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export interface ApiErrorBody {
  message: string;
}

export interface ApplicationSummary {
  accounts: number;
  gw2ApiTokens: number;
  verifiedGw2Accounts: number;
  applications: number;
  applicationClients: number;
  applicationClientAccounts: number;
}

export enum Issuer {
  GITHUB = 'github',
  GOOGLE = 'google',
  COGNITO = 'cognito',
}

export interface AuthInfo {
  sessionId: string;
  sessionCreationTime: string;
  accountCreationTime: string;
  issuer: Issuer;
  idAtIssuer: string;
}

export interface Account {
  federations: ReadonlyArray<AccountFederation>;
  sessions: ReadonlyArray<AccountFederationSession>;
}

export interface AccountFederation {
  issuer: Issuer;
  idAtIssuer: string;
}

export interface AccountFederationSession {
  id: string;
  issuer: Issuer;
  idAtIssuer: string;
  creationTime: string;
}

export type VerificationStatus = 'NONE' | 'PENDING' | 'VERIFIED';
export interface Gw2Account {
  name: string;
  displayName: string;
  creationTime: string;
  verificationStatus: VerificationStatus;
  apiToken?: ApiToken;
  authorizedApps: ReadonlyArray<AuthorizedApplication>;
}

export interface Gw2AccountListItem {
  id: string;
  name: string;
  displayName: string;
  creationTime: string;
  verificationStatus: VerificationStatus;
  apiToken?: string;
  authorizedApps: number;
}

export interface AuthorizedApplication {
  id: string;
  name: string;
  lastUsed: string;
}

export const AllGw2ApiPermissions: ReadonlyArray<Gw2ApiPermission> = [
  'account',
  'builds',
  'characters',
  'guilds',
  'inventories',
  'progression',
  'pvp',
  'wvw',
  'tradingpost',
  'unlocks',
  'wallet',
];
export type Gw2ApiPermission = 'account' | 'builds' | 'characters' | 'guilds' | 'inventories' | 'progression' | 'pvp' | 'wvw' | 'tradingpost' | 'unlocks' | 'wallet';
export interface ApiToken {
  value: string;
  creationTime: string;
  permissions: ReadonlyArray<Gw2ApiPermission>;
}

export interface ApiTokenAddOrUpdate {
  value: string;
  creationTime: string;
  permissions: ReadonlyArray<Gw2ApiPermission>;
  verified: boolean;
}

export interface ApiTokenAddVerification {
  tokenName: string;
}

export interface ApplicationListItem {
  id: string;
  displayName: string;
  userId: string;
  lastUsed?: string;
  authorizedScopes: ReadonlyArray<string>;
}

export interface Application {
  displayName: string;
  userId: string;
  lastUsed?: string;
  authorizedScopes: ReadonlyArray<string>;
  authorizedGw2Accounts: ReadonlyArray<ApplicationGw2Account>;
}

export interface ApplicationGw2Account {
  id: string;
  name: string;
  displayName: string;
}

export interface DevApplicationListItem {
  id: string;
  creationTime: string;
  displayName: string;
  clientCount: number;
  userCount: number;
}

export interface PagedResponse<T> {
  items: ReadonlyArray<T>;
  nextToken?: string;
}

export interface DevApplication {
  creationTime: string;
  displayName: string;
  clients: ReadonlyArray<DevApplicationClientListItem>;
  apiKeys: ReadonlyArray<DevApplicationApiKeyListItem>;
}

export interface DevApplicationCreation {
  id: string;
}

export type DevApplicationClientType = 'CONFIDENTIAL' | 'PUBLIC';
export interface DevApplicationClientListItem {
  id: string;
  creationTime: string;
  displayName: string;
  apiVersion: number;
  type: DevApplicationClientType;
  requiresApproval: boolean;
}

export type DevApplicationApiKeyPermission = 'read' | 'client:create' | 'client:modify';
export interface DevApplicationApiKeyListItem {
  id: string;
  permissions: ReadonlyArray<DevApplicationApiKeyPermission>;
  notBefore: string;
  expiresAt: string;
}

export interface DevApplicationClientCreation {
  id: string;
  creationTime: string;
  displayName: string;
  apiVersion: number;
  type: DevApplicationClientType;
  redirectURIs: ReadonlyArray<string>;
  requiresApproval: boolean;
  clientSecret: string;
}

export interface DevApplicationClient {
  creationTime: string;
  displayName: string;
  apiVersion: number;
  type: DevApplicationClientType;
  redirectURIs: ReadonlyArray<string>;
  requiresApproval: boolean;
}

export interface DevApplicationUser {
  userId: string;
  creationTime: string;
  client?: DevApplicationUserClient;
}

export type ApprovalStatus = 'APPROVED' | 'PENDING' | 'BLOCKED';
export interface DevApplicationUserClient {
  clientId: string;
  approvalStatus: ApprovalStatus;
  approvalRequestMessage: string;
  authorizedScopes: ReadonlyArray<string>;
}

export interface DevApplicationUserUpdate {
  approvalStatus: ApprovalStatus;
  approvalMessage: string;
}

export interface DevApplicationApiKeyCreation {
  id: string;
  key: string;
  permissions: ReadonlyArray<DevApplicationApiKeyPermission>;
  notBefore: string;
  expiresAt: string;
}

export interface OAuth2ConsentInfo {
  clientRegistration: {
    displayName: string;
    creationTime: string;
  },
  requestedScopes: ReadonlyArray<string>;
  submitFormUri: string;
  submitFormParameters: Record<string, ReadonlyArray<string>>;
  cancelUri: string;
  apiTokensWithSufficientPermissions: ReadonlyArray<MinimalApiToken>;
  apiTokensWithInsufficientPermissions: ReadonlyArray<MinimalApiToken>;
  previouslyConsentedGw2AccountIds: ReadonlyArray<string>;
  containsAnyGw2AccountRelatedScopes: boolean;
  redirectUri: string;
  requestUri: string;
}

export interface MinimalApiToken {
  gw2AccountId: string;
  displayName: string;
  isValid: boolean;
  isVerified: boolean;
}

export interface OAuth2TokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface VerificationStartedChallenge {
  challengeId: number;
  state: string;
  creationTime: string;
  availableGw2Accounts: ReadonlyArray<VerificationAvailableGw2Account>;
}

export interface VerificationAvailableGw2Account {
  id: string;
  name: string;
  displayName: string;
  apiToken: string;
}

export interface VerificationPendingChallenge {
  gw2AccountId: string;
  gw2AccountName: string;
  gw2AccountDisplayName: string;
  challengeId: number;
  state: string;
  creationTime: string;
  submitTime: string;
  timeoutTime: string;
}

export interface VerificationStart {
  challengeId: number;
  message: JsonObject;
  nextAllowedStartTime: string;
}

export interface VerificationSubmitSuccess {
  pending: null;
  isSuccess: true;
}

export interface VerificationSubmitPending {
  pending: LegacyVerificationPendingChallenge;
  isSuccess: false;
}

export interface LegacyVerificationPendingChallenge {
  challengeId: number;
  gw2AccountId: string;
  startedAt: string;
}

export type VerificationSubmit = VerificationSubmitSuccess | VerificationSubmitPending;

export interface Notification {
  type: 'success' | 'info' | 'warning' | 'error' | 'in-progress';
  header?: string;
  content?: string;
}
