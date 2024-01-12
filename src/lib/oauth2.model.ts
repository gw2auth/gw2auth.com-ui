export const OAUTH2_SCOPES: ReadonlyArray<string> = [
  'gw2:account',
  'gw2:builds',
  'gw2:characters',
  'gw2:guilds',
  'gw2:inventories',
  'gw2:progression',
  'gw2:pvp',
  'gw2:tradingpost',
  'gw2:unlocks',
  'gw2:wallet',
  'gw2auth:verified',
];

export const OAuth2ParamNames = {
  CLIENT_ID: 'client_id',
  CLIENT_SECRET: 'client_secret',
  STATE: 'state',
  SCOPE: 'scope',
  RESPONSE_TYPE: 'response_type',
  PROMPT: 'prompt',
  REDIRECT_URI: 'redirect_uri',
  CODE_CHALLENGE: 'code_challenge',
  CODE_CHALLENGE_METHOD: 'code_challenge_method',
  CODE_VERIFIER: 'code_verifier',
  CODE: 'code',
  ERROR: 'error',
  ERROR_DESCRIPTION: 'error_description',
  GRANT_TYPE: 'grant_type',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const OAuth2Params = {
  GrantType: {
    AUTHORIZATION_CODE: 'authorization_code',
    REFRESH_TOKEN: 'refresh_token',
  },
  ResponseType: {
    CODE: 'code',
  },
  Prompt: {
    CONSENT: 'consent',
  },
  CodeChallengeMethod: {
    S256: 'S256',
    PLAIN: 'plain',
  },
} as const;
