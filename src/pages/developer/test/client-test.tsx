import {
  Button, Checkbox,
  Container, ContentLayout,
  Form,
  FormField,
  Header,
  Input, Multiselect, MultiselectProps,
  SpaceBetween, Textarea, Tiles,
} from '@cloudscape-design/components';
import React, { useEffect, useMemo, useState } from 'react';
import { useHref, useParams } from 'react-router-dom';
import { RouterInlineLink } from '../../../components/common/router-link';
import { OAUTH2_SCOPES, OAuth2ParamNames, OAuth2Params } from '../../../lib/oauth2.model';

export function ClientTest() {
  const { applicationId, clientId } = useParams();
  if (applicationId === undefined || clientId === undefined) {
    return undefined;
  }

  const allOptions: Array<MultiselectProps.Option> = [];
  const apiPermissionGroup: MultiselectProps.OptionGroup = {
    label: 'GW2 API Permissions',
    options: [],
  };
  const gw2authGroup: MultiselectProps.OptionGroup = {
    label: 'GW2Auth',
    options: [],
  };
  const scopeOptions: Array<MultiselectProps.Option | MultiselectProps.OptionGroup> = [apiPermissionGroup, gw2authGroup];

  for (const scope of OAUTH2_SCOPES) {
    let group: MultiselectProps.OptionGroup | undefined;
    const option: MultiselectProps.Option = {
      value: scope,
    };

    if (scope.startsWith('gw2:')) {
      group = apiPermissionGroup;
      option.label = scope.replace('gw2:', '');
    } else if (scope.startsWith('gw2auth:')) {
      group = gw2authGroup;
      option.label = scope.replace('gw2auth:', '');
    } else {
      option.label = scope;
    }

    allOptions.push(option);
    if (group !== undefined) {
      group.options = [...group.options, option];
    } else {
      scopeOptions.push(option);
    }
  }

  const clientHref = useHref(`/dev/applications/${encodeURIComponent(applicationId)}/clients/${clientId}`);
  const authorizationBaseURL = `${window.location.protocol}//${window.location.host}/oauth2/authorize`;
  const redirectURI = `${window.location.protocol}//${window.location.host}${clientHref}/test/callback`;
  const [statePlain, codeChallengePlain] = useMemo(() => [
    generateState(),
    generateCodeChallenge(),
  ], []);

  const [authorizationName, setAuthorizationName] = useState('');
  const [scopes, setScopes] = useState<ReadonlyArray<MultiselectProps.Option>>(allOptions);
  const [forceConsent, setForceConsent] = useState(true);
  const [codeChallengeMethod, setCodeChallengeMethod] = useState<string>(OAuth2Params.CodeChallengeMethod.S256);
  const [state, setState] = useState('');
  const [codeChallenge, setCodeChallenge] = useState('');

  useEffect(() => {
    (async () => {
      if (codeChallengeMethod === '') {
        setState(statePlain);
        setCodeChallenge('');
        return;
      }

      if (codeChallengeMethod === OAuth2Params.CodeChallengeMethod.PLAIN) {
        setState(encodeState(codeChallengeMethod, codeChallengePlain));
        setCodeChallenge(codeChallengePlain);
        return;
      }

      if (codeChallengeMethod === OAuth2Params.CodeChallengeMethod.S256) {
        setState(encodeState(codeChallengeMethod, codeChallengePlain));
        setCodeChallenge(await sha256CodeChallenge(codeChallengePlain));
        return;
      }

      throw new Error('invalid state');
    })()
      .finally(() => {});
  }, [statePlain, codeChallengePlain, codeChallengeMethod]);

  const scopesErrorText = useMemo(() => {
    const gw2Scopes = scopes.map((v) => v.value).filter((v) => v?.startsWith('gw2:'));
    if (gw2Scopes.length > 0) {
      return '';
    }

    return 'At least one GW2 API Permission scope required';
  }, [scopes]);

  const authorizationRequestURL = useMemo(() => {
    const params = new URLSearchParams();
    params.set(OAuth2ParamNames.CLIENT_ID, clientId);
    params.set(OAuth2ParamNames.RESPONSE_TYPE, OAuth2Params.ResponseType.CODE);
    params.set(OAuth2ParamNames.SCOPE, scopes.map((v) => v.value).join(' '));
    params.set(OAuth2ParamNames.REDIRECT_URI, redirectURI);

    if (authorizationName.length > 0) {
      params.set('name', authorizationName);
    }

    if (forceConsent) {
      params.set(OAuth2ParamNames.PROMPT, OAuth2Params.Prompt.CONSENT);
    }

    if (codeChallengeMethod !== '') {
      params.set(OAuth2ParamNames.CODE_CHALLENGE_METHOD, codeChallengeMethod);
      params.set(OAuth2ParamNames.CODE_CHALLENGE, codeChallenge);
    }

    params.set(OAuth2ParamNames.STATE, state);

    return `${authorizationBaseURL}?${params.toString()}`;
  }, [authorizationBaseURL, redirectURI, clientId, authorizationName, scopes, forceConsent, codeChallengeMethod, codeChallenge, state]);

  return (
    <ContentLayout header={<Header variant={'h1'}>Test Client {clientId}</Header>} headerVariant={'high-contrast'}>
      <Form
        actions={
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <RouterInlineLink to={clientHref} variant={'link'}>Cancel</RouterInlineLink>
            <Button variant={'primary'} href={authorizationRequestURL}>Test</Button>
          </SpaceBetween>
        }
      >
        <Container>
          <SpaceBetween direction={'vertical'} size={'l'}>
            <FormField label={'Authorization Name'} description={'A custom name for this authorization - optional'}>
              <Input value={authorizationName} type={'text'} onChange={(e) => setAuthorizationName(e.detail.value)} />
            </FormField>

            <FormField label={'Scopes'} description={'The scopes to request for this authorization'} errorText={scopesErrorText}>
              <Multiselect
                filteringType={'auto'}
                options={scopeOptions}
                selectedOptions={scopes}
                onChange={(e) => setScopes(e.detail.selectedOptions)}
                keepOpen={true}
              />
            </FormField>

            <FormField label={'Force Consent'} description={'Whether to force the consent prompt to be shown even if the consent was already given'}>
              <Checkbox checked={forceConsent} onChange={(e) => setForceConsent(e.detail.checked)}>Force consent prompt</Checkbox>
            </FormField>

            <FormField label={'Code Challenge Method'} description={'Adds an additional layer of trust'}>
              <Tiles
                value={codeChallengeMethod}
                onChange={(e) => setCodeChallengeMethod(e.detail.value)}
                items={[
                  { label: 'none', value: '' },
                  { label: OAuth2Params.CodeChallengeMethod.S256, value: OAuth2Params.CodeChallengeMethod.S256 },
                  { label: OAuth2Params.CodeChallengeMethod.PLAIN, value: OAuth2Params.CodeChallengeMethod.PLAIN, disabled: true },
                ]}
              />
            </FormField>

            <FormField label={'Code Challenge'} description={'Managed by this UI. You would need to generate this on your side'}>
              <Input value={codeChallenge} type={'text'} disabled={true} />
            </FormField>

            <FormField label={'State'} description={'Managed by this UI. You would need to generate this on your side'}>
              <Input value={state} type={'text'} disabled={true} />
            </FormField>

            <FormField label={'Client ID'} description={'Managed by this UI'}>
              <Input value={clientId} type={'text'} disabled={true} />
            </FormField>

            <FormField label={'Redirect URI'} description={'Managed by this UI'}>
              <Input value={redirectURI} type={'url'} disabled={true} />
            </FormField>

            <FormField label={'Authorization URL'} description={'The resulting authorization URL'}>
              <Textarea value={authorizationRequestURL} rows={10} disabled={true} />
            </FormField>
          </SpaceBetween>
        </Container>
      </Form>
    </ContentLayout>
  );
}

function generateState() {
  return randomString('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 32);
}

function generateCodeChallenge() {
  return randomString('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~', 128);
}

function randomString(chars: string, length: number) {
  let result = '';
  while (result.length < length) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

function encodeState(codeChallengeMethod: string, codeChallenge: string) {
  return base64URLNoPadding(JSON.stringify([codeChallengeMethod, codeChallenge]));
}

async function sha256CodeChallenge(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLNoPadding(String.fromCharCode(...new Uint8Array(hash)));
}

function base64URLNoPadding(value: string) {
  return btoa(value)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}
