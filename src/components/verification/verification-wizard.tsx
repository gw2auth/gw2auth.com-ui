import {
  Alert,
  Badge,
  Box,
  Button,
  ColumnLayout,
  Container,
  ContentLayout,
  Form,
  FormField, Header,
  Input, Link, Select, SpaceBetween,
  Spinner,
  Tiles,
  Wizard,
  WizardProps,
} from '@cloudscape-design/components';
import React, { useEffect, useMemo, useState } from 'react';
import { expectSuccess } from '../../lib/api/api';
import {
  Gw2ApiPermission,
  VerificationAvailableGw2Account,
  VerificationStartedChallenge,
} from '../../lib/api/api.model';
import { EffectivePreferences } from '../../lib/preferences.model';
import {
  CreateAPIToken1, CreateAPIToken2, CreateAPIToken3, Gw2Login, Tradingpost,
} from '../common/assets';
import { Copy } from '../common/copy';
import { Gw2ApiPermissions } from '../common/gw2-api-permissions';
import { catchNotify, useAppControls } from '../util/context/app-controls';
import { useHttpClient } from '../util/context/http-client';
import { usePreferences } from '../util/state/use-preferences';

interface Gw2Item {
  name: string;
  icon: string;
}

interface TPBuyOrderState {
  itemId: number;
  price: number;
}

interface TPBuyOrderStateFull {
  item: Gw2Item;
  state: TPBuyOrderState;
}

export function VerificationSelection({ onCancel, onContinue }: { onCancel?: () => void, onContinue: (id: number) => void }) {
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();

  const [isLoading, setLoading] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<VerificationStartedChallenge>();
  const [challenge, setChallenge] = useState('2');

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.getVerificationActiveChallenge());
      setActiveChallenge(body ?? undefined);

      if (body !== null) {
        setChallenge(body.challengeId.toString());
      }
    })()
      .catch(catchNotify(notification, 'Failed to load active challenge'))
      .finally(() => setLoading(false));
  }, [notification, apiClient]);

  function onContinueClick() {
    const challengeId = parseInt(challenge, 10);

    if (activeChallenge === undefined || challengeId !== activeChallenge.challengeId) {
      setLoading(true);
      (async () => {
        const { body } = expectSuccess(await apiClient.startVerificationChallenge(challengeId));
        onContinue(body.challengeId);
      })()
        .catch(catchNotify(notification, 'Failed to start new challenge'))
        .finally(() => setLoading(false));
    } else {
      onContinue(activeChallenge.challengeId);
    }
  }

  if (isLoading && activeChallenge === undefined) {
    return (
      <Spinner size={'large'} />
    );
  }

  return (
    <Form
      actions={<SpaceBetween direction={'horizontal'} size={'xs'}>
        {onCancel !== undefined && <Button variant={'link'} disabled={isLoading} onClick={onCancel}>Cancel</Button>}
        <Button variant={'primary'} loading={isLoading} onClick={onContinueClick}>Continue</Button>
      </SpaceBetween>}
    >
      <FormField label={'Challenge'} stretch={true}>
        <Tiles
          onChange={(e) => setChallenge(e.detail.value)}
          value={challenge}
          items={[
            {
              value: '1',
              label: <ChallengeLabel name={'API Token Name'} recommended={false} />,
              description: 'Create a new API Token using a name provided in the next step',
              image: <Gw2ApiPermissions permissions={requiredPermissions(1)} />,
            },
            {
              value: '2',
              label: <ChallengeLabel name={'TP Buy-Order'} recommended={true} />,
              description: 'Place a buy-order in the ingame tradingpost. Requires 1-30 Gold. The placed gold can be gained back by dropping the buy-order upon successful verification.',
              image: <Gw2ApiPermissions permissions={requiredPermissions(2)} />,
            },
            {
              value: '3',
              label: <ChallengeLabel name={'Character Name'} recommended={false} />,
              description: 'Create a new character using a name provided in the next step. Requires one free character slot. The character can be deleted upon successful verification.',
              image: <Gw2ApiPermissions permissions={requiredPermissions(3)} />,
            },
          ]}
        />
      </FormField>
    </Form>
  );
}

export function VerificationWizard({ onDismiss }: { onDismiss: () => void }) {
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();

  const [isLoading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<VerificationStartedChallenge>();

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.getVerificationActiveChallenge());
      setActiveChallenge(body ?? undefined);
    })()
      .catch(catchNotify(notification, 'Failed to load active challenge'))
      .finally(() => setLoading(false));
  }, [notification, apiClient]);

  if (isLoading) {
    return (
      <Wizard
        submitButtonText={'Submit'}
        isLoadingNextStep={isLoading}
        onCancel={onDismiss}
        steps={[]}
      />
    );
  } if (activeChallenge === undefined) {
    return (
      <ContentLayout>
        <Container>
          <Box>Failed to load</Box>
        </Container>
      </ContentLayout>
    );
  }

  return (
    <InternalVerificationWizard activeChallenge={activeChallenge} onDismiss={onDismiss} />
  );
}

function InternalVerificationWizard({ activeChallenge, onDismiss }: { activeChallenge: VerificationStartedChallenge, onDismiss: () => void }) {
  const [preferences] = usePreferences();
  const { notification } = useAppControls();
  const { httpClient, apiClient } = useHttpClient();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const [tpBuyOrderState, setTpBuyOrderState] = useState<TPBuyOrderStateFull>();

  useEffect(() => {
    if (activeChallenge.challengeId !== 2) {
      setTpBuyOrderState(undefined);
      return;
    }

    (async () => {
      const state = JSON.parse(activeChallenge.state) as TPBuyOrderState;
      const params = new URLSearchParams();
      params.set('v', '2024-01-06');
      params.set('lang', preferences.effectiveLocale);

      const itemRes = await httpClient.fetch(`https://api.guildwars2.com/v2/items/${encodeURIComponent(state.itemId)}?${params.toString()}`);
      if (itemRes.status !== 200) {
        throw new Error('gw2 API returned invalid status');
      }

      setTpBuyOrderState({
        item: (await itemRes.json()) as Gw2Item,
        state: state,
      });
    })()
      .catch(catchNotify(notification, 'Failed to load item info'));
  }, [preferences, httpClient, activeChallenge]);

  const steps: Array<WizardProps.Step> = [];
  const embeds = youTubeVideoEmbeds(activeChallenge.challengeId);
  if (embeds.length > 0) {
    steps.push({
      title: 'Video Guide',
      description: 'You may follow the Video Guide below',
      content: (
        <ColumnLayout columns={1}>
          <Box>The video guides have not been updated for the new website yet. The overall workflow remains the same.</Box>
          <ColumnLayout columns={embeds.length}>
            {...(embeds.map((src) => <YouTubeEmbed src={src} />))}
          </ColumnLayout>
        </ColumnLayout>
      ),
      isOptional: true,
    });
  }

  if (activeChallenge.challengeId === 1) {
    steps.push(
      ...addApiTokenSteps(preferences, requiredPermissions(1), activeChallenge.state, false),
      {
        title: 'Add API Token',
        description: 'Paste the newly generated API Token to submit the verification',
        content: <AddChallengeApiToken value={apiToken} onChange={setApiToken} disabled={isLoading} />,
      },
    );
  } else {
    steps.push({
      title: 'Login to Guild Wars 2',
      description: 'Login to Guild Wars 2 using the Account you wish to verify',
      content: 'Login to Guild Wars 2 using the Account you wish to verify and follow the next steps',
    });

    if (activeChallenge.challengeId === 2 && tpBuyOrderState !== undefined) {
      let coins = tpBuyOrderState.state.price;
      const copper = coins % 100;
      coins = (coins - copper) / 100;
      const silver = coins % 100;
      coins = (coins - silver) / 100;

      const iconSrc = tpBuyOrderState.item.icon
        .replace('https://render.guildwars2.com/file/', 'https://icons-gw2.darthmaim-cdn.com/')
        .replace('.png', '-64px.png');

      steps.push({
        title: `Place a Buy-Order for ${tpBuyOrderState.item.name}`,
        description: 'Place the buy-order as stated below to let GW2Auth verify you are the legitimate owner of this Guild Wars 2 Account',
        content: (
          <ColumnLayout columns={1}>
            <Box>Using the ingame tradingpost, search for</Box>
            <Box variant={'h2'}>
              <ImgText src={iconSrc} alt={tpBuyOrderState.item.name} />
              {tpBuyOrderState.item.name}
            </Box>

            <Box>And place a buy-order with <Box variant={'strong'}>exactly</Box></Box>
            <Box variant={'h2'}>
              {coins}
              <ImgText src={'/assets/gold_coin.png'} alt={'Gold Coin'} />
              {silver}
              <ImgText src={'/assets/silver_coin.png'} alt={'Silver Coin'} />
              {copper}
              <ImgText src={'/assets/copper_coin.png'} alt={'Copper Coin'} />
            </Box>

            <Tradingpost
              lang={preferences.effectiveLocale}
              iconHref={iconSrc}
              name={tpBuyOrderState.item.name}
              gold={coins}
              silver={silver}
              copper={copper}
            />

            <Box variant={'small'}>The buy-order can be removed once the verification succeeded</Box>
          </ColumnLayout>
        ),
      });
    } else if (activeChallenge.challengeId === 3) {
      steps.push({
        title: 'Create a verification Character',
        description: 'Create a character as stated below to let GW2Auth verify you are the legitimate owner of this Guild Wars 2 Account',
        content: (
          <ColumnLayout columns={1}>
            <Box>Create a new character using the name</Box>
            <Copy copyText={activeChallenge.state}>{activeChallenge.state}</Copy>
            <Box variant={'small'}>The character can be deleted once the verification succeeded</Box>
          </ColumnLayout>
        ),
      });
    }

    if (activeChallenge.availableGw2Accounts.length > 0) {
      steps.push({
        title: 'Create new API Token - Info',
        description: 'The following steps may be skipped',
        content: (
          <ColumnLayout columns={1}>
            <Alert type={'info'}>
              <Box>If the Guild Wars 2 Account you performed the previous steps with appears in the list below, <Box variant={'strong'}>you may skip the steps to create a new API Token</Box>.</Box>
            </Alert>
            <SelectChallengeApiToken
              availableGw2Accounts={activeChallenge.availableGw2Accounts}
              value={apiToken}
              onChange={(v) => {
                setApiToken(v);
                setActiveStepIndex(steps.length - 1);
              }}
              disabled={isLoading}
            />
          </ColumnLayout>
        ),
      });
    }

    steps.push(
      ...addApiTokenSteps(preferences, requiredPermissions(activeChallenge.challengeId), undefined, activeChallenge.availableGw2Accounts.length > 0),
    );

    steps.push({
      title: 'Select or add API Token',
      description: 'Select an existing API Token or paste the newly generated one to submit the verification',
      content: (
        <ColumnLayout columns={1}>
          <SelectChallengeApiToken availableGw2Accounts={activeChallenge.availableGw2Accounts} value={apiToken} onChange={setApiToken} disabled={isLoading} />
          <AddChallengeApiToken value={apiToken} onChange={setApiToken} disabled={isLoading} />
        </ColumnLayout>
      ),
    });
  }

  function onSubmit() {
    const updateNotification = notification.add({
      type: 'in-progress',
      content: 'Submitting challenge...',
      dismissible: false,
    });

    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.submitVerificationChallenge(apiToken));
      if (body.isSuccess) {
        updateNotification({
          type: 'success',
          content: 'Verification succeeded! Your Guild Wars 2 Account is now verified.',
          dismissible: true,
        });
      } else {
        updateNotification({
          type: 'in-progress',
          content: 'The verification was submitted, but it could not be verified yet. This may happen due to the Guild Wars 2 API not showing the latest data. Please watch the status of this verification on the verification page.',
          dismissible: true,
        });
      }

      onDismiss();
    })()
      .catch(catchNotify(updateNotification, 'Failed to submit verification challenge'))
      .finally(() => setLoading(false));
  }

  return (
    <Wizard
      submitButtonText={'Submit'}
      onCancel={onDismiss}
      onSubmit={onSubmit}
      isLoadingNextStep={isLoading}
      allowSkipTo={true}
      activeStepIndex={activeStepIndex}
      onNavigate={(e) => setActiveStepIndex(e.detail.requestedStepIndex)}
      steps={steps}
    />
  );
}

function ChallengeLabel({ name, recommended }: { name: string, recommended: boolean }) {
  const badges: Array<React.ReactNode> = [];
  if (recommended) {
    badges.push(<Badge color={'green'}>Recommended</Badge>);
  }

  return (
    <Box>{name} {...badges}</Box>
  );
}

function SelectChallengeApiToken({
  availableGw2Accounts, value, onChange, disabled, 
}: { availableGw2Accounts: ReadonlyArray<VerificationAvailableGw2Account>, value: string, onChange: (v: string) => void, disabled: boolean }) {
  const options = availableGw2Accounts.map((acc) => ({
    value: acc.apiToken,
    label: acc.displayName,
    description: acc.name,
    filteringTags: [acc.id],
  }));

  const selectedOption = useMemo(() => {
    const r = options.filter((v) => v.value === value);
    if (r.length < 1) {
      return null;
    }

    return r[0];
  }, [value]);

  return (
    <FormField label={'Existing API Token'} description={'Use an existing API Token'} stretch={true}>
      <Select
        onChange={(e) => onChange(e.detail.selectedOption.value!)}
        selectedOption={selectedOption}
        options={options}
        filteringType={'auto'}
        disabled={disabled}
        empty={'No existing API Tokens available'}
      />
    </FormField>
  );
}

function AddChallengeApiToken({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) {
  return (
    <FormField label={'API Token'} description={'Paste the API Token here'} stretch={true}>
      <Input value={value} type={'text'} onChange={(e) => onChange(e.detail.value)} disabled={disabled} />
    </FormField>
  );
}

function ImgText({ src, alt }: { src: string, alt: string }) {
  return (
    <img style={{ height: '1em', width: 'auto', verticalAlign: 'middle' }} src={src} alt={alt} />
  );
}

function YouTubeEmbed({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
      title={'YouTube video player'}
      frameBorder={'0'}
      allow={'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'}
      allowFullScreen
    />
  );
}

function addApiTokenSteps(preferences: EffectivePreferences, permissions: ReadonlyArray<Gw2ApiPermission>, tokenName: string | undefined, optional: boolean): ReadonlyArray<WizardProps.Step> {
  return [
    {
      title: 'Login on the GW2 Website',
      description: 'Login on the official website of Guild Wars 2 using the Guild Wars 2 Account you wish to verify',
      content: (
        <ColumnLayout columns={1}>
          <Box>Visit the <Link href={'https://account.arena.net/applications'} external={true}>Guild Wars 2 Account Page</Link> and login using the Guild Wars 2 Account you wish to verify.</Box>
          <Gw2Login lang={preferences.effectiveLocale} />
        </ColumnLayout>
      ),
      isOptional: optional,
    },
    {
      title: 'Create a new API Token',
      description: 'Click the button to create a new API Token',
      content: (
        <CreateAPIToken1 variant={preferences.effectiveColorScheme} lang={preferences.effectiveLocale} />
      ),
      isOptional: optional,
    },
    {
      title: 'Assign name and permissions',
      description: 'Assign name and permissions',
      content: (
        <ColumnLayout columns={1}>
          <SpaceBetween size={'xxs'} direction={'vertical'}>
            <Header variant={'h3'}>Name</Header>
            {
              (tokenName !== undefined && <Copy copyText={tokenName}><Box variant={'samp'}>{tokenName}</Box></Copy>)
              || <Box>Choose any name you like</Box>
            }
          </SpaceBetween>
          <SpaceBetween size={'xxs'} direction={'vertical'}>
            <Header variant={'h3'}>Required Permissions</Header>
            <Gw2ApiPermissions permissions={permissions} />
          </SpaceBetween>
          <CreateAPIToken2 name={tokenName ?? 'GW2Auth'} variant={preferences.effectiveColorScheme} lang={preferences.effectiveLocale} permissions={permissions} />
        </ColumnLayout>
      ),
      isOptional: optional,
    },
    {
      title: 'Copy the API Token',
      description: 'Click the button shown below to copy your newly created API Token',
      content: <CreateAPIToken3 variant={preferences.effectiveColorScheme} lang={preferences.effectiveLocale} />,
      isOptional: optional,
    },
  ];
}

function requiredPermissions(challengeId: number): ReadonlyArray<Gw2ApiPermission> {
  switch (challengeId) {
    case 1:
      return ['account'];

    case 2:
      return ['account', 'tradingpost'];

    case 3:
      return ['account', 'characters'];

    default:
      throw new Error('invalid challenge');
  }
}

function youTubeVideoEmbeds(challengeId: number): ReadonlyArray<string> {
  switch (challengeId) {
    case 1:
      return ['https://www.youtube.com/embed/xgaG9ysH3is?si=kKGqIzz5CNzEPTM0'];

    case 2:
      return ['https://www.youtube.com/embed/W1Gu4kCLx0g?si=RdM5GFGZlfxL1hzU', 'https://www.youtube.com/embed/Lt50s84D2b4?si=X0LPp3SOL46HTURM'];

    case 3:
      return ['https://www.youtube.com/embed/MJMdTtlId1Y?si=66Cu5WUgE5cZcYxs', 'https://www.youtube.com/embed/SD7FqZC9zwA?si=bqbIDqpHUDSI42XA'];

    default:
      throw new Error('invalid challenge');
  }
}
