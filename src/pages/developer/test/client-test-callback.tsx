import {
  Button,
  Container, Form, FormField, Header, Input, SpaceBetween, Textarea,
} from '@cloudscape-design/components';
import React, { useMemo, useState } from 'react';
import { useHref, useParams, useSearchParams } from 'react-router-dom';
import { RouterInlineLink } from '../../../components/common/router-link';
import { catchNotify, useAppControls } from '../../../components/util/context/app-controls';
import { useHttpClient } from '../../../components/util/context/http-client';
import { expectSuccess } from '../../../lib/api/api';
import { OAuth2TokenResponse } from '../../../lib/api/api.model';
import { OAuth2ParamNames } from '../../../lib/oauth2.model';

export function ClientTestCallback() {
  const { applicationId, clientId } = useParams();
  if (applicationId === undefined || clientId === undefined) {
    return undefined;
  }

  const [searchParams] = useSearchParams();
  const state = searchParams.get(OAuth2ParamNames.STATE);
  const code = searchParams.get(OAuth2ParamNames.CODE);
  const error = searchParams.get(OAuth2ParamNames.ERROR);
  const errorDescription = searchParams.get(OAuth2ParamNames.ERROR_DESCRIPTION);

  let content: React.ReactNode;
  if (state === null || code === null || error !== null) {
    content = <ErrorContent applicationId={applicationId} clientId={clientId} error={error ?? 'No state or code present'} errorDescription={errorDescription ?? ''} />;
  } else {
    content = <SuccessContent applicationId={applicationId} clientId={clientId} code={code} state={state} />;
  }

  return content;
}

function SuccessContent({
  applicationId, clientId, code, state: rawState,
}: { applicationId: string; clientId: string; code: string; state: string; }) {
  const redirectURI = `${window.location.protocol}//${window.location.host}/dev/applications/${encodeURIComponent(applicationId)}/clients/${clientId}/test/callback`;
  const codeChallenge = parseState(rawState);
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();

  const [isLoading, setLoading] = useState(false);
  const [tokenResponse, setTokenResponse] = useState<OAuth2TokenResponse>();
  const [clientSecret, setClientSecret] = useState('');
  const [jwt, refreshToken] = useMemo(() => {
    if (tokenResponse === undefined) {
      const x = [{}, {}, ''] satisfies [unknown, unknown, string];
      return [x, undefined];
    }

    return [parseJWT(tokenResponse.access_token), tokenResponse.refresh_token];
  }, [tokenResponse]);

  function onRetrieveTokenClick() {
    setLoading(true);
    (async () => {
      let body: OAuth2TokenResponse;
      if (refreshToken === undefined) {
        body = expectSuccess(await apiClient.retrieveTokenByCode(clientId, clientSecret, code, redirectURI, codeChallenge)).body;
      } else {
        body = expectSuccess(await apiClient.retrieveTokenByRefreshToken(clientId, clientSecret, refreshToken)).body;
      }

      setTokenResponse(body);
    })()
      .catch(catchNotify(notification, 'Failed to retrieve token'))
      .finally(() => setLoading(false));
  }

  return (
    <Form
      variant={'full-page'}
      header={<Header variant={'h1'}>Test Client {clientId} Callback</Header>}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <CancelButton applicationId={applicationId} clientId={clientId} />
          <Button variant={'primary'} loading={isLoading} onClick={onRetrieveTokenClick}>Retrieve Token</Button>
        </SpaceBetween>
      }
    >
      <Container>
        <SpaceBetween direction={'vertical'} size={'l'}>
          <FormField label={'Client Secret'} description={'Paste your client secret here'}>
            <Input value={clientSecret} type={'password'} disableBrowserAutocorrect={true} onChange={(e) => setClientSecret(e.detail.value)} />
          </FormField>

          <FormField label={'Raw Response'}>
            <Textarea value={JSON.stringify(tokenResponse, null, 2)} rows={5} disabled={true} />
          </FormField>

          <FormField label={'Access Token Header'}>
            <Textarea value={JSON.stringify(jwt[0], null, 2)} rows={4} disabled={true} />
          </FormField>

          <FormField label={'Access Token Payload'}>
            <Textarea value={JSON.stringify(jwt[1], null, 2)} rows={10} disabled={true} />
          </FormField>

          <FormField label={'Access Token Signature'}>
            <Input value={jwt[2]} disabled={true} />
          </FormField>

          <FormField label={'Refresh Token'}>
            <Input value={tokenResponse?.refresh_token ?? ''} disabled={true} />
          </FormField>

          <FormField label={'Expires In'} description={'Time until the access token expires, in seconds'}>
            <Input value={tokenResponse?.expires_in?.toString() ?? ''} type={'number'} disabled={true} />
          </FormField>
        </SpaceBetween>
      </Container>
    </Form>
  );
}

function ErrorContent({
  applicationId, clientId, error, errorDescription, 
}: { applicationId: string; clientId: string; error: string; errorDescription: string }) {
  return (
    <Form
      variant={'full-page'}
      header={<Header variant={'h1'}>Test Client {clientId} Callback</Header>}
      actions={<CancelButton applicationId={applicationId} clientId={clientId} />}
    >
      <Container>
        <SpaceBetween direction={'vertical'} size={'l'}>
          <FormField label={'Error'}>
            <Input value={error} type={'text'} disabled={true} />
          </FormField>

          <FormField label={'Error Description'}>
            <Input value={errorDescription} type={'text'} disabled={true} />
          </FormField>
        </SpaceBetween>
      </Container>
    </Form>
  );
}

function CancelButton({ applicationId, clientId }: { applicationId: string; clientId: string }) {
  const href = useHref(`/dev/applications/${encodeURIComponent(applicationId)}/clients/${encodeURIComponent(clientId)}/test`);
  return (
    <RouterInlineLink to={href} variant={'link'}>Cancel</RouterInlineLink>
  );
}

function parseState(state: string) {
  try {
    const dec = base64URLDecode(state);
    const res = JSON.parse(dec) as [string, string];
    if (res.length !== 2 || typeof res[0] !== 'string' || typeof res[1] !== 'string') {
      return undefined;
    }

    return res[1];
  } catch (e) {
    return undefined;
  }
}

function parseJWT(jwt: string): [unknown, unknown, string] {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    return [{}, {}, ''];
  }

  return [
    JSON.parse(base64URLDecode(parts[0])),
    JSON.parse(base64URLDecode(parts[1])),
    parts[2],
  ];
}

function base64URLDecode(b64: string) {
  return atob(
    b64
      .replaceAll('-', '+')
      .replaceAll('_', '/'),
  );
}
