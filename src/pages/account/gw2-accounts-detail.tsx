import {
  Alert,
  Box,
  Button,
  ColumnLayout,
  Container,
  ContentLayout,
  FormField,
  Header,
  Input,
  Modal,
  SpaceBetween,
  Spinner,
  Tiles,
} from '@cloudscape-design/components';
import React, { useEffect, useMemo, useState } from 'react';
import { useHref, useParams } from 'react-router-dom';
import { Copy } from '../../components/common/copy';
import { CustomTable } from '../../components/common/custom-table';
import { DeleteModal, DeleteModalProps } from '../../components/common/delete-modal';
import { Gw2ApiPermissions } from '../../components/common/gw2-api-permissions';
import { KeyValuePairs, ValueWithLabel } from '../../components/common/key-value-pairs';
import { RouterInlineLink } from '../../components/common/router-link';
import { VerificationStatusIndicator } from '../../components/common/verification-status';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { useI18n } from '../../components/util/context/i18n';
import { useDateFormat } from '../../components/util/state/use-dateformat';
import { useDependentState } from '../../components/util/state/use-dependent-state';
import { expectSuccess } from '../../lib/api/api';
import { ApiToken, Gw2Account, Gw2ApiPermission } from '../../lib/api/api.model';

interface Gw2ApiTokenInfo {
  id: string;
  name: string;
  permissions: ReadonlyArray<Gw2ApiPermission>;
}

interface Gw2ApiAccount {
  id: string;
}

export function Gw2AccountsDetail() {
  const { id } = useParams();
  if (id === undefined) {
    throw new Error();
  }

  const i18n = useI18n();
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();

  const [isLoading, setLoading] = useState(false);
  const [gw2Account, setGw2Account] = useState<Gw2Account>();
  const [showTokenDeleteModal, setShowTokenDeleteModal] = useState(false);
  const [apiTokenDeleteLoading, setApiTokenDeleteLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const resp = expectSuccess(await apiClient.getGw2Account(id));
      setGw2Account(resp.body);
    })()
      .catch(catchNotify(notification, i18n.general.failedToLoad('Guild Wars 2 Account')))
      .finally(() => setLoading(false));
  }, [id, apiClient]);

  let overview: React.ReactNode;
  let content: React.ReactNode;
  let applications: React.ReactNode;
  if (isLoading) {
    overview = <Spinner size={'large'} />;
    content = <Spinner size={'large'} />;
    applications = <Container variant={'stacked'}><Spinner size={'large'} /></Container>;
  } else if (gw2Account === undefined) {
    overview = <Box>{i18n.general.failedToLoad('')}</Box>;
    content = <Box>{i18n.general.failedToLoad('')}</Box>;
    applications = <Container variant={'stacked'}><Box>{i18n.general.failedToLoad('')}</Box></Container>;
  } else {
    overview = <Overview id={id} gw2Account={gw2Account} />;
    content = <Gw2AccountDetailContent id={id} gw2Account={gw2Account} />;
    applications = <ApplicationsTable gw2Account={gw2Account} />;
  }

  return (
    <>
      <TokenDeleteModal
        item={showTokenDeleteModal ? '' : undefined}
        loading={apiTokenDeleteLoading}
        onDismiss={(e) => {
          if (e.detail.reason !== 'delete') {
            setShowTokenDeleteModal(false);
            return;
          }

          const updateNotification = notification.add({
            type: 'in-progress',
            content: i18n.pages.gw2AccountsDetail.deleteApiTokenInProgress,
            dismissible: false,
          });

          setApiTokenDeleteLoading(true);
          (async () => {
            expectSuccess(await apiClient.deleteApiToken(id));
            setGw2Account((prev) => (prev !== undefined ? { ...prev, apiToken: undefined } : undefined));
            updateNotification({
              type: 'success',
              content: i18n.pages.gw2AccountsDetail.deleteApiTokenSuccess,
              dismissible: true,
            });
          })()
            .catch(catchNotify(updateNotification, i18n.pages.gw2AccountsDetail.deleteApiTokenFailed))
            .finally(() => {
              setApiTokenDeleteLoading(false);
              setShowTokenDeleteModal(false);
            });
        }}
      />
      <ContentLayout
        header={
          <Header
            variant={'h1'}
            actions={
              <Button
                disabled={gw2Account?.apiToken === undefined}
                loading={apiTokenDeleteLoading}
                onClick={() => setShowTokenDeleteModal(true)}
              >{i18n.pages.gw2AccountsDetail.deleteApiToken}</Button>
          }
          >{gw2Account?.name ?? id}</Header>
        }
      >
        <ColumnLayout columns={1}>
          <Container variant={'stacked'}>{overview}</Container>
          <Container variant={'stacked'}>{content}</Container>
          {applications}
        </ColumnLayout>
      </ContentLayout>
    </>
  );
}

function Overview({ id, gw2Account }: { id: string, gw2Account: Gw2Account }) {
  const i18n = useI18n();
  const { formatDateTime } = useDateFormat();

  return (
    <KeyValuePairs columns={3}>
      <ValueWithLabel label={i18n.pages.gw2AccountsDetail.id}>
        <Copy copyText={id}><Box variant={'samp'}>{id}</Box></Copy>
      </ValueWithLabel>
      <ValueWithLabel label={i18n.pages.gw2AccountsDetail.created}>
        <Box>{formatDateTime(gw2Account.creationTime)}</Box>
      </ValueWithLabel>
      <ValueWithLabel label={i18n.pages.gw2AccountsDetail.verificationStatus}>
        <VerificationStatusIndicator status={gw2Account.verificationStatus} />
      </ValueWithLabel>
    </KeyValuePairs>
  );
}

function Gw2AccountDetailContent({ id, gw2Account: _gw2Account }: { id: string, gw2Account: Gw2Account }) {
  const i18n = useI18n();
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const [gw2Account, setGw2Account] = useDependentState(_gw2Account);
  const [displayName, setDisplayName] = useState(gw2Account.displayName);
  const [displayNameLoading, setDisplayNameLoading] = useState(false);

  const displayNameError = useMemo(() => {
    if (displayName.length < 1) {
      return i18n.pages.gw2AccountsDetail.formErrors.canNotBeEmpty;
    } if (displayName.length > 100) {
      return i18n.pages.gw2AccountsDetail.formErrors.canNotBeLongerThan(100);
    }

    return '';
  }, [i18n, displayName]);

  function undoDisplayName() {
    setDisplayName(gw2Account.displayName);
  }

  function saveDisplayName() {
    setDisplayNameLoading(true);
    (async () => {
      expectSuccess(await apiClient.updateGw2Account(id, displayName));
      setGw2Account((v) => ({ ...v, displayName: displayName }));
    })()
      .catch(catchNotify(notification, 'Failed to update the Display Name'))
      .finally(() => setDisplayNameLoading(false));
  }

  return (
    <SpaceBetween size={'xxl'} direction={'vertical'}>
      <SpaceBetween size={'s'} direction={'vertical'}>
        <FormField
          label={<Header variant={'h2'}>{i18n.pages.gw2AccountsDetail.displayName.label}</Header>}
          description={i18n.pages.gw2AccountsDetail.displayName.description}
          secondaryControl={<Button iconName={'undo'} onClick={undoDisplayName} disabled={displayName === gw2Account.displayName} />}
          errorText={displayNameError}
        >
          <Input value={displayName} disabled={displayNameLoading} onChange={(e) => setDisplayName(e.detail.value)} />
        </FormField>
        <Button variant={'primary'} loading={displayNameLoading} disabled={displayNameError.length > 0 || displayName === gw2Account.displayName} onClick={saveDisplayName}>Save</Button>
      </SpaceBetween>

      {
        (
          gw2Account.apiToken !== undefined
          && <ExistingApiToken
            gw2AccountId={id}
            apiToken={gw2Account.apiToken}
            onUpdate={(v) => setGw2Account((prev) => ({ ...prev, apiToken: v }))}
          />
        ) || <NonExistingApiToken gw2AccountId={id} onUpdate={(v) => setGw2Account((prev) => ({ ...prev, apiToken: v }))} />
      }
    </SpaceBetween>
  );
}

function ExistingApiToken({ gw2AccountId, apiToken, onUpdate }: { gw2AccountId: string, apiToken: ApiToken, onUpdate: (v: ApiToken | undefined) => void }) {
  const i18n = useI18n();
  const { httpClient, apiClient } = useHttpClient();
  const { notification } = useAppControls();

  const [apiTokenValue, setApiTokenValue] = useState(apiToken.value);
  const [apiTokenLoading, setApiTokenLoading] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [apiTokenError, setApiTokenError] = useState('');
  const [showTokenSelectionModal, setShowTokenSelectionModal] = useState(false);
  const [newTokenPermissions, setNewTokenPermissions] = useState<ReadonlyArray<Gw2ApiPermission>>([]);

  function saveApiToken() {
    setApiTokenLoading(true);
    (async () => {
      const params = new URLSearchParams();
      params.set('access_token', apiTokenValue);

      const [tokenInfoRes, accountRes] = await Promise.all([
        httpClient.fetch(`https://api.guildwars2.com/v2/tokeninfo?${params.toString()}`),
        httpClient.fetch(`https://api.guildwars2.com/v2/account?${params.toString()}`),
      ]);

      if (tokenInfoRes.status !== 200 || accountRes.status !== 200) {
        setApiTokenError(i18n.pages.gw2AccountsDetail.submitErrors.apiTokenInvalid);
        return;
      }

      const tokenInfo = (await tokenInfoRes.json()) as Gw2ApiTokenInfo;
      const account = (await accountRes.json()) as Gw2ApiAccount;

      if (account.id.toLowerCase() !== gw2AccountId.toLowerCase()) {
        setApiTokenError(i18n.pages.gw2AccountsDetail.submitErrors.apiTokenForDifferentGw2Account);
        return;
      }

      if (apiToken.permissions.every((v) => tokenInfo.permissions.includes(v))) {
        const resp = await apiClient.updateApiToken(gw2AccountId, apiTokenValue);
        if (resp.error !== undefined) {
          setApiTokenError(resp.error.message);
          return;
        }

        onUpdate(resp.body);
      } else {
        setNewTokenPermissions(tokenInfo.permissions);
        setShowTokenSelectionModal(true);
      }
    })()
      .catch(catchNotify(notification))
      .finally(() => setApiTokenLoading(false));
  }

  return (

    <>
      <TokenSelectionModal
        visible={showTokenSelectionModal}
        loading={apiTokenLoading}
        onSaveClick={(id) => {
          if (id === 'current') {
            setApiTokenValue(apiToken.value);
            setShowTokenSelectionModal(false);
            return;
          }

          setApiTokenLoading(true);
          (async () => {
            const resp = await apiClient.updateApiToken(gw2AccountId, apiTokenValue);
            if (resp.error !== undefined) {
              setApiTokenError(resp.error.message);
              return;
            }

            onUpdate(resp.body);
          })()
            .catch(catchNotify(notification))
            .finally(() => {
              setApiTokenLoading(false);
              setShowTokenSelectionModal(false);
            });
        }}
        onCancelClick={() => {
          setApiTokenValue(apiToken.value);
          setShowTokenSelectionModal(false);
        }}
        currentApiToken={{
          id: 'current',
          permissions: apiToken.permissions,
        }}
        newApiToken={{
          id: 'new',
          permissions: newTokenPermissions,
        }}
      />
      <SpaceBetween size={'s'} direction={'vertical'}>
        <FormField
          label={<Header variant={'h2'}>{i18n.pages.gw2AccountsDetail.apiToken.label}</Header>}
          description={i18n.pages.gw2AccountsDetail.apiToken.description}
          secondaryControl={<Button iconName={showApiToken ? 'lock-private' : 'unlocked'} onClick={() => setShowApiToken((v) => !v)} />}
          errorText={apiTokenError}
        >
          <Input value={apiTokenValue} type={showApiToken ? 'text' : 'password'} disabled={apiTokenLoading} disableBrowserAutocorrect={true} spellcheck={false} onChange={(e) => setApiTokenValue(e.detail.value)} />
        </FormField>
        <Gw2ApiPermissions permissions={apiToken.permissions} />
        <Button variant={'primary'} loading={apiTokenLoading} disabled={apiTokenValue === apiToken.value} onClick={saveApiToken}>Save</Button>
      </SpaceBetween>
    </>
  );
}

function NonExistingApiToken({ gw2AccountId, onUpdate }: { gw2AccountId: string, onUpdate: (v: ApiToken | undefined) => void }) {
  const i18n = useI18n();
  const { httpClient, apiClient } = useHttpClient();
  const { notification } = useAppControls();

  const [apiTokenValue, setApiTokenValue] = useState('');
  const [apiTokenLoading, setApiTokenLoading] = useState(false);
  const [showApiToken, setShowApiToken] = useState(true);
  const [apiTokenError, setApiTokenError] = useState('');

  function saveApiToken() {
    setApiTokenLoading(true);
    (async () => {
      const accountRes = await httpClient.fetch(`https://api.guildwars2.com/v2/account?access_token=${encodeURIComponent(apiTokenValue)}`);
      if (accountRes.status !== 200) {
        setApiTokenError(i18n.pages.gw2AccountsDetail.submitErrors.apiTokenInvalid);
        return;
      }

      const account = (await accountRes.json()) as Gw2ApiAccount;
      if (account.id.toLowerCase() !== gw2AccountId.toLowerCase()) {
        setApiTokenError(i18n.pages.gw2AccountsDetail.submitErrors.apiTokenForDifferentGw2Account);
        return;
      }

      const resp = await apiClient.addApiToken(gw2AccountId, apiTokenValue);
      if (resp.error !== undefined) {
        setApiTokenError(resp.error.message);
        return;
      }

      onUpdate(resp.body);
    })()
      .catch(catchNotify(notification))
      .finally(() => setApiTokenLoading(false));
  }

  return (
    <SpaceBetween size={'s'} direction={'vertical'}>
      <FormField
        label={<Header variant={'h2'}>{i18n.pages.gw2AccountsDetail.apiToken.label}</Header>}
        description={i18n.pages.gw2AccountsDetail.apiToken.description}
        secondaryControl={<Button iconName={showApiToken ? 'lock-private' : 'unlocked'} onClick={() => setShowApiToken((v) => !v)} />}
        errorText={apiTokenError}
      >
        <Input value={apiTokenValue} type={showApiToken ? 'text' : 'password'} disabled={apiTokenLoading} disableBrowserAutocorrect={true} spellcheck={false} onChange={(e) => setApiTokenValue(e.detail.value)} />
      </FormField>
      <Button variant={'primary'} loading={apiTokenLoading} onClick={saveApiToken}>Add</Button>
    </SpaceBetween>
  );
}

function ApplicationsTable({ gw2Account }: { gw2Account: Gw2Account }) {
  const i18n = useI18n();
  const { formatDateTime } = useDateFormat();
  const baseHref = useHref('/applications');

  return (
    <CustomTable
      columnDefinitions={[
        {
          id: 'name',
          header: i18n.pages.gw2AccountsDetail.authorizedApplicationsTableColumns.name,
          cell: (v) => v.name,
          sortingField: 'name',
        },
        {
          id: 'last_used',
          header: i18n.pages.gw2AccountsDetail.authorizedApplicationsTableColumns.lastUsed,
          cell: (v) => formatDateTime(v.lastUsed),
          sortingField: 'lastUsed',
        },
        {
          id: 'actions',
          header: i18n.general.actions,
          cell: (v) => <RouterInlineLink to={`${baseHref}/${encodeURIComponent(v.id)}`}>{i18n.general.view}</RouterInlineLink>,
          alwaysVisible: true,
          preferencesDisable: true,
        },
      ]}
      stickyColumns={{ first: 0, last: 1 }}
      items={gw2Account.authorizedApps}
      variant={'stacked'}
      filter={<Header variant={'h2'} counter={`(${gw2Account.authorizedApps.length})`}>{i18n.pages.gw2AccountsDetail.authorizedApplications}</Header>}
      empty={
        <SpaceBetween size={'m'} direction={'vertical'} alignItems={'center'}>
          <Box variant={'h5'}>{i18n.pages.gw2AccountsDetail.noApplicationsAuthorized}</Box>
        </SpaceBetween>
      }
    />
  );
}

interface TokenSelectionModalProps {
  visible: boolean;
  loading: boolean;
  onSaveClick: (id: string) => void;
  onCancelClick: () => void;
  currentApiToken: {
    id: string;
    permissions: ReadonlyArray<Gw2ApiPermission>;
  };
  newApiToken: {
    id: string;
    permissions: ReadonlyArray<Gw2ApiPermission>;
  };
}

function TokenSelectionModal(props: TokenSelectionModalProps) {
  const i18n = useI18n();
  const {
    visible, loading, onSaveClick, onCancelClick, currentApiToken, newApiToken,
  } = props;
  const [value, setValue] = useState(currentApiToken.id);

  return (
    <Modal
      visible={visible}
      onDismiss={onCancelClick}
      header={i18n.pages.gw2AccountsDetail.selectApiToken.header}
      footer={
        <Box float={'right'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button disabled={loading} variant={'link'} onClick={onCancelClick}>{i18n.general.cancel}</Button>
            <Button loading={loading} variant={'primary'} onClick={() => onSaveClick(value)}>{i18n.general.save}</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <ColumnLayout columns={1}>
        <Alert type={'warning'}>
          <SpaceBetween size={'xs'} direction={'vertical'}>
            {i18n.pages.gw2AccountsDetail.selectApiToken.warning}
          </SpaceBetween>
        </Alert>
        <Tiles
          onChange={(e) => setValue(e.detail.value)}
          value={value}
          items={[
            {
              value: currentApiToken.id,
              label: i18n.pages.gw2AccountsDetail.selectApiToken.keepCurrent.label,
              description: i18n.pages.gw2AccountsDetail.selectApiToken.keepCurrent.description,
              image: <Gw2ApiPermissions permissions={currentApiToken.permissions} />,
              disabled: loading,
            },
            {
              value: newApiToken.id,
              label: i18n.pages.gw2AccountsDetail.selectApiToken.saveNew.label,
              description: i18n.pages.gw2AccountsDetail.selectApiToken.saveNew.description,
              image: <Gw2ApiPermissions permissions={newApiToken.permissions} />,
              disabled: loading,
            },
          ]}
        />
      </ColumnLayout>
    </Modal>
  );
}

function TokenDeleteModal(props: Omit<DeleteModalProps<string>, 'entityType'>) {
  const i18n = useI18n();

  return (
    <DeleteModal
      {...props}
      entityType={i18n.pages.gw2AccountsDetail.entity}
    >
      <SpaceBetween size={'xs'} direction={'vertical'}>
        <Alert type={'warning'}>
          <SpaceBetween size={'xs'} direction={'vertical'}>
            {i18n.pages.gw2AccountsDetail.deleteApiTokenWarn}
          </SpaceBetween>
        </Alert>
        <Alert type={'info'}>
          {i18n.pages.gw2AccountsDetail.deleteApiTokenInfo}
        </Alert>
      </SpaceBetween>
    </DeleteModal>
  );
}
