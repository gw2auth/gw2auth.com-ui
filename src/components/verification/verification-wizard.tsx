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
import { I18nFormats } from '../../lib/i18n/i18n.model';
import { EffectivePreferences } from '../../lib/preferences.model';
import {
  CreateAPIToken1, CreateAPIToken2, CreateAPIToken3, Gw2Login, Tradingpost,
} from '../common/assets';
import { Copy, CopyButton } from '../common/copy';
import { Gw2ApiPermissions } from '../common/gw2-api-permissions';
import { catchNotify, useAppControls, useSplitPanel } from '../util/context/app-controls';
import { useHttpClient } from '../util/context/http-client';
import { useI18n } from '../util/context/i18n';
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
  const i18n = useI18n();
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
      .catch(catchNotify(notification, i18n.general.failedToLoad(i18n.components.verification.activeChallenge)))
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
        .catch(catchNotify(notification, i18n.general.failedToLoad(i18n.components.verification.newChallenge)))
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
        {onCancel !== undefined && <Button variant={'link'} disabled={isLoading} onClick={onCancel}>{i18n.general.cancel}</Button>}
        <Button variant={'primary'} loading={isLoading} onClick={onContinueClick}>{i18n.general.continue}</Button>
      </SpaceBetween>}
    >
      <FormField label={i18n.components.verification.challenge} stretch={true}>
        <Tiles
          onChange={(e) => setChallenge(e.detail.value)}
          value={challenge}
          items={[
            {
              value: '1',
              label: <ChallengeLabel name={i18n.components.verification.challenges.tokenName.label} recommended={false} />,
              description: i18n.components.verification.challenges.tokenName.description,
              image: <Gw2ApiPermissions permissions={requiredPermissions(1)} />,
            },
            {
              value: '2',
              label: <ChallengeLabel name={i18n.components.verification.challenges.tpBuyOrder.label} recommended={true} />,
              description: i18n.components.verification.challenges.tpBuyOrder.description,
              image: <Gw2ApiPermissions permissions={requiredPermissions(2)} />,
            },
            {
              value: '3',
              label: <ChallengeLabel name={i18n.components.verification.challenges.characterName.label} recommended={false} />,
              description: i18n.components.verification.challenges.characterName.description,
              image: <Gw2ApiPermissions permissions={requiredPermissions(3)} />,
            },
          ]}
        />
      </FormField>
    </Form>
  );
}

export function VerificationWizard({ onDismiss }: { onDismiss: () => void }) {
  const i18n = useI18n();
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
      .catch(catchNotify(notification, i18n.general.failedToLoad(i18n.components.verification.activeChallenge)))
      .finally(() => setLoading(false));
  }, [notification, apiClient]);

  if (isLoading) {
    return (
      <Wizard
        submitButtonText={i18n.general.submit}
        isLoadingNextStep={isLoading}
        onCancel={onDismiss}
        steps={[]}
      />
    );
  } if (activeChallenge === undefined) {
    return (
      <ContentLayout>
        <Container>
          <Box>{i18n.general.failedToLoad('')}</Box>
        </Container>
      </ContentLayout>
    );
  }

  return (
    <InternalVerificationWizard activeChallenge={activeChallenge} onDismiss={onDismiss} />
  );
}

export function PendingChallengeWizard({ challengeId, state, onDismiss }: { challengeId: number, state: string, onDismiss: () => void }) {
  const i18n = useI18n();
  const [preferences] = usePreferences();
  const tpBuyOrderState = useTpBuyOrderState(challengeId, state);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps = useChallengeSpecificSteps(i18n, preferences, challengeId, state, tpBuyOrderState);

  return (
    <Wizard
      submitButtonText={i18n.components.verification.backToOverview}
      onCancel={onDismiss}
      onSubmit={onDismiss}
      allowSkipTo={true}
      activeStepIndex={activeStepIndex}
      onNavigate={(e) => setActiveStepIndex(e.detail.requestedStepIndex)}
      steps={steps}
    />
  );
}

function InternalVerificationWizard({ activeChallenge, onDismiss }: { activeChallenge: VerificationStartedChallenge, onDismiss: () => void }) {
  const i18n = useI18n();
  const [preferences] = usePreferences();
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const tpBuyOrderState = useTpBuyOrderState(activeChallenge.challengeId, activeChallenge.state);

  const isExistingApiToken = useMemo(() => activeChallenge.availableGw2Accounts.find((v) => v.apiToken === apiToken) !== undefined, [apiToken, activeChallenge]);

  useSplitPanel(
    'Video Guide',
    <YouTubeEmbed src={youTubeVideoEmbed(activeChallenge.challengeId)} />,
  );

  const challengeSpecificSteps = useChallengeSpecificSteps(i18n, preferences, activeChallenge.challengeId, activeChallenge.state, tpBuyOrderState);
  const steps: Array<WizardProps.Step> = [...challengeSpecificSteps];

  if (activeChallenge.challengeId === 1) {
    steps.push(
      {
        title: i18n.components.verification.wizard.enterApiToken.title,
        description: i18n.components.verification.wizard.enterApiToken.description,
        content: <AddChallengeApiToken value={apiToken} onChange={setApiToken} disabled={isLoading} />,
      },
    );
  } else {
    if (activeChallenge.availableGw2Accounts.length > 0) {
      steps.push({
        title: i18n.components.verification.wizard.createApiTokenInfo.title,
        description: i18n.components.verification.wizard.createApiTokenInfo.description,
        content: (
          <ColumnLayout columns={1}>
            <Alert type={'info'}>
              {i18n.components.verification.wizard.createApiTokenInfo.content}
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
      ...addApiTokenSteps(i18n, preferences, requiredPermissions(activeChallenge.challengeId), undefined, activeChallenge.availableGw2Accounts.length > 0),
    );

    steps.push({
      title: i18n.components.verification.wizard.selectOrEnterApiToken.title,
      description: i18n.components.verification.wizard.selectOrEnterApiToken.description,
      content: (
        <ColumnLayout columns={1}>
          <SelectChallengeApiToken availableGw2Accounts={activeChallenge.availableGw2Accounts} value={apiToken} onChange={setApiToken} disabled={isLoading} />
          <AddChallengeApiToken value={apiToken} onChange={setApiToken} disabled={isLoading} />
          {
            !isExistingApiToken
              ? <Alert type={'info'}>{i18n.components.verification.wizard.selectOrEnterApiToken.infoWillOnlyBeUsedForVerification}</Alert>
              : undefined
          }
        </ColumnLayout>
      ),
    });
  }

  function onSubmit() {
    const updateNotification = notification.add({
      type: 'in-progress',
      content: i18n.components.verification.wizard.actions.submitInProgress,
      dismissible: false,
    });

    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.submitVerificationChallenge(apiToken));
      if (body.isSuccess) {
        updateNotification({
          type: 'success',
          content: i18n.components.verification.wizard.actions.succeeded,
          dismissible: true,
        });
      } else {
        updateNotification({
          type: 'in-progress',
          content: i18n.components.verification.wizard.actions.inProgress,
          dismissible: true,
        });
      }

      onDismiss();
    })()
      .catch(catchNotify(updateNotification, i18n.components.verification.wizard.actions.failedToSubmit))
      .finally(() => setLoading(false));
  }

  return (
    <Wizard
      submitButtonText={i18n.general.submit}
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

function useChallengeSpecificSteps(i18n: I18nFormats, preferences: EffectivePreferences, challengeId: number, rawState: string, tpBuyOrderState?: TPBuyOrderStateFull) {
  return useMemo<ReadonlyArray<WizardProps.Step>>(() => {
    const steps: Array<WizardProps.Step> = [];

    if (challengeId === 1) {
      steps.push(
        ...addApiTokenSteps(i18n, preferences, requiredPermissions(1), rawState, false),
      );
    } else {
      steps.push({
        title: i18n.components.verification.wizard.gw2GameLogin.title,
        description: i18n.components.verification.wizard.gw2GameLogin.description,
        content: i18n.components.verification.wizard.gw2GameLogin.content,
      });

      if (challengeId === 2 && tpBuyOrderState !== undefined) {
        let coins = tpBuyOrderState.state.price;
        const copper = coins % 100;
        coins = (coins - copper) / 100;
        const silver = coins % 100;
        coins = (coins - silver) / 100;

        const iconSrc = tpBuyOrderState.item.icon
          .replace('https://render.guildwars2.com/file/', 'https://icons-gw2.darthmaim-cdn.com/')
          .replace('.png', '-64px.png');

        steps.push({
          title: i18n.components.verification.wizard.placeBuyOrder.title(tpBuyOrderState.item.name),
          description: i18n.components.verification.wizard.placeBuyOrder.description(tpBuyOrderState.item.name),
          content: (
            <ColumnLayout columns={1}>
              <Alert type={'info'}>
                <ColumnLayout columns={1}>
                  {
                    i18n.components.verification.wizard.placeBuyOrder.content(
                      () => <CopyButton copyText={tpBuyOrderState.item.name} iconUrl={iconSrc}>{tpBuyOrderState.item.name}</CopyButton>,
                      () => (
                        <Box variant={'h2'}>
                          {coins}
                          <ImgText src={'/assets/gold_coin.png'} alt={'Gold Coin'} />
                          {silver}
                          <ImgText src={'/assets/silver_coin.png'} alt={'Silver Coin'} />
                          {copper}
                          <ImgText src={'/assets/copper_coin.png'} alt={'Copper Coin'} />
                        </Box>
                      ),
                    )
                  }
                </ColumnLayout>
              </Alert>

              <Tradingpost
                iconHref={iconSrc}
                name={tpBuyOrderState.item.name}
                gold={coins}
                silver={silver}
                copper={copper}
              />

              <Box variant={'small'}>{i18n.components.verification.wizard.placeBuyOrder.footNode}</Box>
            </ColumnLayout>
          ),
        });
      } else if (challengeId === 3) {
        steps.push({
          title: i18n.components.verification.wizard.createCharacter.title(rawState),
          description: i18n.components.verification.wizard.createCharacter.description(rawState),
          content: (
            <Alert type={'info'}>
              <ColumnLayout columns={1}>
                {i18n.components.verification.wizard.createCharacter.content(() => <CopyButton copyText={rawState}>{rawState}</CopyButton>)}
                <Box variant={'small'}>{i18n.components.verification.wizard.createCharacter.footNode}</Box>
              </ColumnLayout>
            </Alert>
          ),
        });
      }
    }

    return steps;
  }, [i18n, preferences, challengeId, rawState, tpBuyOrderState]);
}

function ChallengeLabel({ name, recommended }: { name: string, recommended: boolean }) {
  const i18n = useI18n();
  const badges: Array<React.ReactNode> = [];
  if (recommended) {
    badges.push(<Badge color={'green'}>{i18n.components.verification.recommended}</Badge>);
  }

  return (
    <Box>{name} {...badges}</Box>
  );
}

function SelectChallengeApiToken({
  availableGw2Accounts, value, onChange, disabled, 
}: { availableGw2Accounts: ReadonlyArray<VerificationAvailableGw2Account>, value: string, onChange: (v: string) => void, disabled: boolean }) {
  const i18n = useI18n();
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
    <FormField label={i18n.components.verification.wizard.selectApiToken.formFieldName} description={i18n.components.verification.wizard.selectApiToken.formFieldDescription} stretch={true}>
      <Select
        onChange={(e) => onChange(e.detail.selectedOption.value!)}
        selectedOption={selectedOption}
        options={options}
        filteringType={'auto'}
        disabled={disabled}
        empty={i18n.components.verification.wizard.selectApiToken.noneAvailable}
      />
    </FormField>
  );
}

function AddChallengeApiToken({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) {
  const i18n = useI18n();

  return (
    <FormField label={i18n.components.verification.wizard.enterApiToken.formFieldName} description={i18n.components.verification.wizard.enterApiToken.formFieldDescription} stretch={true}>
      <Input value={value} type={'text'} disableBrowserAutocorrect={true} spellcheck={false} onChange={(e) => onChange(e.detail.value)} disabled={disabled} />
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
      referrerPolicy={'strict-origin-when-cross-origin'}
      allowFullScreen
    />
  );
}

function addApiTokenSteps(i18n: I18nFormats, preferences: EffectivePreferences, permissions: ReadonlyArray<Gw2ApiPermission>, tokenName: string | undefined, optional: boolean): ReadonlyArray<WizardProps.Step> {
  return [
    {
      title: i18n.components.verification.wizard.createApiToken.gw2Login.title,
      description: i18n.components.verification.wizard.createApiToken.gw2Login.description,
      content: (
        <ColumnLayout columns={1}>
          {i18n.components.verification.wizard.createApiToken.gw2Login.content(({ children }) => <Link href={'https://account.arena.net/applications'} external={true}>{children}</Link>)}
          <Gw2Login />
        </ColumnLayout>
      ),
      isOptional: optional,
    },
    {
      title: i18n.components.verification.wizard.createApiToken.createToken.title,
      description: i18n.components.verification.wizard.createApiToken.createToken.description,
      content: (
        <CreateAPIToken1 variant={preferences.effectiveColorScheme} />
      ),
      isOptional: optional,
    },
    {
      title: i18n.components.verification.wizard.createApiToken.assignNameAndPermissions.title,
      description: i18n.components.verification.wizard.createApiToken.assignNameAndPermissions.description,
      content: (
        <ColumnLayout columns={1}>
          <Alert type={'info'}>
            <ColumnLayout columns={1}>
              <FormField label={<Header variant={'h3'}>{i18n.components.verification.wizard.createApiToken.assignNameAndPermissions.nameFormFieldName}</Header>} description={tokenName !== undefined ? i18n.components.verification.wizard.createApiToken.assignNameAndPermissions.nameFormFieldDescription : ''}>
                {
                  tokenName !== undefined
                    ? <Copy copyText={tokenName}><Box variant={'samp'}>{tokenName}</Box></Copy>
                    : <Box>{i18n.components.verification.wizard.createApiToken.assignNameAndPermissions.anyName}</Box>
                }
              </FormField>

              <FormField label={<Header variant={'h3'}>{i18n.components.verification.wizard.createApiToken.assignNameAndPermissions.permissionsFormFieldName}</Header>} description={i18n.components.verification.wizard.createApiToken.assignNameAndPermissions.permissionsFieldDescription}>
                <Gw2ApiPermissions permissions={permissions} />
              </FormField>
            </ColumnLayout>
          </Alert>
          <CreateAPIToken2 name={tokenName ?? 'GW2Auth'} variant={preferences.effectiveColorScheme} permissions={permissions} />
        </ColumnLayout>
      ),
      isOptional: optional,
    },
    {
      title: i18n.components.verification.wizard.createApiToken.copyToken.title,
      description: i18n.components.verification.wizard.createApiToken.copyToken.description,
      content: <CreateAPIToken3 variant={preferences.effectiveColorScheme} />,
      isOptional: optional,
    },
  ];
}

function useTpBuyOrderState(challengeId: number, rawState: string) {
  const i18n = useI18n();
  const { httpClient } = useHttpClient();
  const { notification } = useAppControls();
  const [tpBuyOrderState, setTpBuyOrderState] = useState<TPBuyOrderStateFull>();

  useEffect(() => {
    if (challengeId !== 2) {
      setTpBuyOrderState(undefined);
      return;
    }

    (async () => {
      const state = JSON.parse(rawState) as TPBuyOrderState;
      const params = new URLSearchParams();
      params.set('v', '2024-01-06');
      params.set('lang', i18n.gw2.lang);

      const itemRes = await httpClient.fetch(`https://api.guildwars2.com/v2/items/${encodeURIComponent(state.itemId)}?${params.toString()}`);
      if (itemRes.status !== 200) {
        throw new Error('gw2 API returned invalid status');
      }

      setTpBuyOrderState({
        item: (await itemRes.json()) as Gw2Item,
        state: state,
      });
    })()
      .catch(catchNotify(notification, i18n.general.failedToLoad(i18n.components.verification.itemInfo)));
  }, [i18n, httpClient, challengeId, rawState]);

  return tpBuyOrderState;
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

function youTubeVideoEmbed(challengeId: number): string {
  switch (challengeId) {
    case 1:
      return 'https://www.youtube-nocookie.com/embed/4pQGPGwowds';

    case 2:
      return 'https://www.youtube-nocookie.com/embed/0ICy3JmEZUU';

    case 3:
      return 'https://www.youtube-nocookie.com/embed/r6P4AWRNcZs';

    default:
      throw new Error('invalid challenge');
  }
}
