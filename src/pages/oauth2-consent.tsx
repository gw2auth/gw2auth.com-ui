import {
  Box,
  Button,
  Container,
  ContentLayout,
  Form,
  FormField,
  Grid,
  Header,
  Multiselect,
  MultiselectProps, SpaceBetween,
  Spinner, TextContent,
} from '@cloudscape-design/components';
import React, {
  useCallback, useEffect, useMemo, useState, 
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { AddApiTokenWizard } from '../components/add-api-token/add-api-token';
import { Scopes } from '../components/scopes/scopes';
import { catchNotify, useAppControls } from '../components/util/context/app-controls';
import { useHttpClient } from '../components/util/context/http-client';
import { useDateFormat } from '../components/util/state/use-dateformat';
import { VerificationSelection, VerificationWizard } from '../components/verification/verification-wizard';
import { expectSuccess } from '../lib/api/api';
import { OAuth2ConsentInfo } from '../lib/api/api.model';
import { OAuth2ParamNames } from '../lib/oauth2.model';

type ActiveWindow = 'form' | 'add-api-token' | 'verification-select' | 'verification-new';

export function OAuth2Consent() {
  const [searchParams] = useSearchParams();
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();

  const [isLoading, setLoading] = useState(true);
  const [consentInfo, setConsentInfo] = useState<OAuth2ConsentInfo>();
  const [activeWindow, setActiveWindow] = useState<ActiveWindow>('form');

  const reloadConsentInfo = useCallback(() => {
    setLoading(true);
    (async () => {
      const clientId = searchParams.get(OAuth2ParamNames.CLIENT_ID);
      const state = searchParams.get(OAuth2ParamNames.STATE);
      const scope = searchParams.get(OAuth2ParamNames.SCOPE);
      if (clientId === null || state === null || scope === null) {
        throw new Error('Missing required parameter');
      }

      const { body } = expectSuccess(await apiClient.getConsentInfo(clientId, state, scope));
      setConsentInfo((prev) => {
        if (prev === undefined && body.apiTokensWithSufficientPermissions.length < 1) {
          setActiveWindow('add-api-token');
        }

        return body;
      });
    })()
      .catch(catchNotify(notification, 'Failed to load OAuth2 consent info'))
      .finally(() => setLoading(false));
  }, [apiClient, searchParams, notification]);

  useEffect(() => {
    reloadConsentInfo();
  }, [reloadConsentInfo]);

  if (activeWindow === 'form' || activeWindow === 'verification-select') {
    let content: React.ReactNode;
    if (isLoading) {
      content = <Spinner size={'large'} />;
    } else if (consentInfo === undefined) {
      content = <Box>Failed to load</Box>;
    } else if (activeWindow === 'verification-select') {
      content = (
        <Container header={<Header variant={'h1'}>Guild Wars 2 Account Verification</Header>}>
          <VerificationSelection onCancel={() => setActiveWindow('form')} onContinue={() => setActiveWindow('verification-new')} />
        </Container>
      );
    } else {
      content = <ConsentForm consentInfo={consentInfo} setActiveWindow={setActiveWindow} />;
    }

    return (
      <ContentLayout>
        <Grid gridDefinition={[{ colspan: { default: 12, xs: 10, s: 8 }, offset: { default: 0, xs: 1, s: 2 } }]}>
          {content}
        </Grid>
      </ContentLayout>
    );
  }

  if (activeWindow === 'add-api-token') {
    return (
      <AddApiTokenWizard onDismiss={() => {
        reloadConsentInfo();
        setActiveWindow('form');
      }} />
    );
  }

  return (
    <VerificationWizard onDismiss={() => {
      reloadConsentInfo();
      setActiveWindow('form');
    }} />
  );
}

function ConsentForm({ consentInfo, setActiveWindow }: { consentInfo: OAuth2ConsentInfo, setActiveWindow: (v: ActiveWindow) => void }) {
  const { formatDate } = useDateFormat();

  const [cancelLoading, setCancelLoading] = useState(false);
  const [authorizeLoading, setAuthorizeLoading] = useState(false);
  const [options, selectedOptions, setSelectedOptions] = buildOptions(consentInfo);

  const verifiedScopeRequest = consentInfo.requestedScopes.includes('gw2auth:verified');
  const hasUnverifiedGw2Account = consentInfo.apiTokensWithSufficientPermissions.some((v) => !v.isVerified) || consentInfo.apiTokensWithInsufficientPermissions.some((v) => !v.isVerified);

  const formInputsAlways = useMemo(() => {
    const elems: Array<React.ReactNode> = [];
    for (const [key, values] of Object.entries(consentInfo.submitFormParameters)) {
      for (const value of values) {
        elems.push((
          <input type={'hidden'} name={key} value={value} />
        ));
      }
    }

    return elems;
  }, [consentInfo]);

  const [formInputsGw2AccountIds, errorText] = useMemo(() => {
    const elems: Array<React.ReactNode> = [];
    for (const option of selectedOptions) {
      elems.push((
        <input type={'hidden'} name={`token:${option.value!}`} value={''} />
      ));
    }

    return [
      elems,
      elems.length < 1 ? 'At least one required' : '',
    ];
  }, [selectedOptions]);

  const redirectBase = useMemo(() => {
    const url = new URL(consentInfo.redirectUri);
    url.search = '';
    url.pathname = '';
    return url.toString();
  }, [consentInfo]);

  return (
    <>
      <Container header={<Header variant={'h1'}>Authorize {consentInfo.clientRegistration.displayName}</Header>} variant={'stacked'}>
        <Box variant={'small'}>Active since {formatDate(consentInfo.clientRegistration.creationTime)}</Box>
      </Container>
      <Container header={<Header variant={'h3'} counter={`(${consentInfo.requestedScopes.length})`}>Requested Permissions</Header>} variant={'stacked'}>
        <Scopes scopes={consentInfo.requestedScopes} />
      </Container>
      <Container variant={'stacked'}>
        <form method={'POST'} action={consentInfo.submitFormUri}>
          <>
            {...formInputsAlways}
            {...formInputsGw2AccountIds}
          </>
          <Form
            variant={'embedded'}
            header={<Header variant={'h3'} counter={`(${selectedOptions.length})`}>Authorize Guild Wars 2 Accounts</Header>}
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button
                  variant={'link'}
                  formAction={'none'}
                  href={consentInfo.cancelUri}
                  disabled={authorizeLoading}
                  loading={cancelLoading}
                  onFollow={() => setCancelLoading(true)}
                >Cancel</Button>

                <Button
                  variant={'primary'}
                  formAction={'submit'}
                  disabled={errorText !== '' || cancelLoading}
                  loading={authorizeLoading}
                  onClick={() => setAuthorizeLoading(true)}
                >Authorize</Button>
              </SpaceBetween>
            }
            secondaryActions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button onClick={() => setActiveWindow('add-api-token')}>Add API Token</Button>
                {verifiedScopeRequest && hasUnverifiedGw2Account && <Button onClick={() => setActiveWindow('verification-select')}>Verify Guild Wars 2 Account</Button>}
              </SpaceBetween>
            }
          >
            <SpaceBetween size={'l'} direction={'vertical'}>
              <FormField stretch={true} label={'Accounts'} description={'The Guild Wars 2 Accounts you want to allow this application to access with the listed permissions'} errorText={errorText}>
                <Multiselect
                  filteringType={'auto'}
                  options={options}
                  selectedOptions={selectedOptions}
                  onChange={(e) => setSelectedOptions(e.detail.selectedOptions)}
                  keepOpen={true}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </form>
      </Container>
      <Container variant={'stacked'} disableContentPaddings={true}>
        <TextContent>
          <Box textAlign={'center'} padding={'xs'}>
            <small>You will be redirected to <b>{redirectBase}</b></small>
          </Box>
        </TextContent>
      </Container>
    </>
  );
}

function buildOptions(consentInfo: OAuth2ConsentInfo) {
  const [options, selectedOptions] = useMemo(() => {
    const requestedVerifiedScope = consentInfo.requestedScopes.includes('gw2auth:verified');

    const tempSelectedOptions: Array<MultiselectProps.Option> = [];
    const sufficientOptions: Array<MultiselectProps.Option> = [];
    const unverifiedOptions: Array<MultiselectProps.Option> = [];
    const invalidOptions: Array<MultiselectProps.Option> = [];
    const insufficientOptions: Array<MultiselectProps.Option> = [];

    for (const gw2ApiToken of consentInfo.apiTokensWithSufficientPermissions) {
      const option: MultiselectProps.Option = {
        value: gw2ApiToken.gw2AccountId,
        label: gw2ApiToken.displayName,
        filteringTags: [gw2ApiToken.gw2AccountId, gw2ApiToken.displayName],
      };

      if (!gw2ApiToken.isValid) {
        option.description = 'Invalid: Please update the API Token of this account';
        invalidOptions.push(option);
      } else if (requestedVerifiedScope && !gw2ApiToken.isVerified) {
        option.description = 'Unverified: This account may be rejected by the application';
        unverifiedOptions.push(option);
      } else {
        sufficientOptions.push(option);
      }

      if (consentInfo.previouslyConsentedGw2AccountIds.includes(gw2ApiToken.gw2AccountId)) {
        tempSelectedOptions.push(option);
      }
    }

    for (const gw2ApiToken of consentInfo.apiTokensWithInsufficientPermissions) {
      insufficientOptions.push({
        value: gw2ApiToken.gw2AccountId,
        label: gw2ApiToken.displayName,
        description: 'The API Token for this account appears to be invalid',
        filteringTags: [gw2ApiToken.gw2AccountId, gw2ApiToken.displayName],
        disabled: true,
      });
    }

    const tempOptions: Array<MultiselectProps.OptionGroup> = [
      {
        label: 'Guild Wars 2 Accounts',
        options: sufficientOptions,
      },
    ];

    if (unverifiedOptions.length > 0) {
      tempOptions.push({
        label: 'Guild Wars 2 Accounts (unverified)',
        options: unverifiedOptions,
      });
    }

    if (invalidOptions.length > 0) {
      tempOptions.push({
        label: 'Guild Wars 2 Accounts (invalid API Token)',
        options: invalidOptions,
      });
    }

    if (insufficientOptions.length > 0) {
      tempOptions.push({
        label: 'Guild Wars 2 Accounts (insufficient permissions)',
        options: insufficientOptions,
      });
    }

    return [tempOptions, tempSelectedOptions];
  }, [consentInfo]);

  const [selectedOptionsState, setSelectedOptions] = useState<ReadonlyArray<MultiselectProps.Option>>(selectedOptions);

  return [options, selectedOptionsState, setSelectedOptions] as const;
}
