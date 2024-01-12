import {
  Alert,
  Box,
  Button,
  ColumnLayout,
  Container,
  ContentLayout,
  FormField,
  Header,
  Input, Link,
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
import { useDependentState } from '../../components/util/state/use-dependent-state';
import { expectSuccess } from '../../lib/api/api';
import {
  ApiToken, Gw2Account, Gw2ApiPermission, VerificationStatus,
} from '../../lib/api/api.model';

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
      .catch(catchNotify(notification, 'Failed to load your Guild Wars 2 Account'))
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
    overview = <Box>Failed to load</Box>;
    content = <Box>Failed to load</Box>;
    applications = <Container variant={'stacked'}><Box>Failed to load</Box></Container>;
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
            content: 'Deleting your API Token...',
            dismissible: false,
          });

          setApiTokenDeleteLoading(true);
          (async () => {
            expectSuccess(await apiClient.deleteApiToken(id));
            setGw2Account((prev) => (prev !== undefined ? { ...prev, apiToken: undefined } : undefined));
            updateNotification({
              type: 'success',
              content: 'Your API Token was deleted',
              dismissible: true,
            });
          })()
            .catch(catchNotify(updateNotification, 'Failed to delete API Token'))
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
              >Delete API Token</Button>
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

  return (
    <KeyValuePairs columns={3}>
      <ValueWithLabel label={'ID'}>
        <Copy copyText={id}><Box variant={'samp'} fontSize={'body-s'}>{id}</Box></Copy>
      </ValueWithLabel>
      <ValueWithLabel label={'Created'}>
        <Box>{i18n.dateTime(new Date(gw2Account.creationTime))}</Box>
      </ValueWithLabel>
      <VerificationStatusValueWithLabel verificationStatus={gw2Account.verificationStatus} />
    </KeyValuePairs>
  );
}

function Gw2AccountDetailContent({ id, gw2Account: _gw2Account }: { id: string, gw2Account: Gw2Account }) {
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const [gw2Account, setGw2Account] = useDependentState(_gw2Account);
  const [displayName, setDisplayName] = useState(gw2Account.displayName);
  const [displayNameLoading, setDisplayNameLoading] = useState(false);

  const displayNameError = useMemo(() => {
    if (displayName.length < 1) {
      return 'Can not be empty';
    } if (displayName.length > 100) {
      return 'Can not be longer than 100 characters';
    }

    return '';
  }, [displayName]);

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
          label={<Header variant={'h2'}>Display Name</Header>}
          description={'A custom name for this GW2 Account, can be shared with applications'}
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
      const [tokenInfoRes, accountRes] = await Promise.all([
        httpClient.fetch(`https://api.guildwars2.com/v2/tokeninfo?access_token=${encodeURIComponent(apiTokenValue)}`),
        httpClient.fetch(`https://api.guildwars2.com/v2/account?access_token=${encodeURIComponent(apiTokenValue)}`),
      ]);

      if (tokenInfoRes.status !== 200 || accountRes.status !== 200) {
        setApiTokenError('The provided API Token is invalid');
        return;
      }

      const tokenInfo = (await tokenInfoRes.json()) as Gw2ApiTokenInfo;
      const account = (await accountRes.json()) as Gw2ApiAccount;

      if (account.id.toLowerCase() !== gw2AccountId.toLowerCase()) {
        setApiTokenError('The provided API Token belongs to a different Guild Wars 2 Account');
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
          label={<Header variant={'h2'}>API Token</Header>}
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
        setApiTokenError('The provided API Token is invalid');
        return;
      }

      const account = (await accountRes.json()) as Gw2ApiAccount;
      if (account.id.toLowerCase() !== gw2AccountId.toLowerCase()) {
        setApiTokenError('The provided API Token belongs to a different Guild Wars 2 Account');
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
        label={<Header variant={'h2'}>API Token</Header>}
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
  const baseHref = useHref('/applications');

  return (
    <CustomTable
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (v) => v.name,
          sortingField: 'name',
        },
        {
          id: 'last_used',
          header: 'Last Used',
          cell: (v) => i18n.dateTime(new Date(v.lastUsed)),
          sortingField: 'lastUsed',
        },
        {
          id: 'actions',
          header: 'Actions',
          cell: (v) => <RouterInlineLink to={`${baseHref}/${encodeURIComponent(v.id)}`}>View</RouterInlineLink>,
          alwaysVisible: true,
          preferencesDisable: true,
        },
      ]}
      stickyColumns={{ first: 0, last: 1 }}
      items={gw2Account.authorizedApps}
      variant={'stacked'}
      filter={<Header variant={'h2'} counter={`(${gw2Account.authorizedApps.length})`}>Authorized Applications</Header>}
      empty={
        <SpaceBetween size={'m'} direction={'vertical'} alignItems={'center'}>
          <Box variant={'h5'}>No applications authorized for this Guild Wars 2 Account</Box>
        </SpaceBetween>
      }
    />
  );
}

function VerificationStatusValueWithLabel({ verificationStatus }: { verificationStatus: VerificationStatus }) {
  return (
    <ValueWithLabel label={'Verification Status'}>
      <VerificationStatusIndicator status={verificationStatus} />
    </ValueWithLabel>
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
  const {
    visible, loading, onSaveClick, onCancelClick, currentApiToken, newApiToken,
  } = props;
  const [value, setValue] = useState(currentApiToken.id);

  return (
    <Modal
      visible={visible}
      onDismiss={onCancelClick}
      header={'Select API Token'}
      footer={
        <Box float={'right'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button disabled={loading} variant={'link'} onClick={onCancelClick}>Cancel</Button>
            <Button loading={loading} variant={'primary'} onClick={() => onSaveClick(value)}>Save</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <ColumnLayout columns={1}>
        <Alert type={'warning'}>
          <SpaceBetween size={'xs'} direction={'vertical'}>
            <Box>Reducing the permissions of the API Token provided to GW2Auth <Box variant={'strong'}>may cause issues</Box> with the application(s) using it.</Box>
            <Box>GW2Auth never shares the API Token itself with authorized applications. Instead, authorized applications are given <Link external={true} href={'https://wiki.guildwars2.com/wiki/API:2/createsubtoken'}>subtokens</Link> using the permissions you have authorized an application to use.</Box>
            <Box>It is recommended to use an API Token with all permissions for GW2Auth.</Box>
          </SpaceBetween>
        </Alert>
        <Tiles
          onChange={(e) => setValue(e.detail.value)}
          value={value}
          items={[
            {
              value: currentApiToken.id,
              label: 'Current',
              description: 'Keep the current API Token',
              image: <Gw2ApiPermissions permissions={currentApiToken.permissions} />,
              disabled: loading,
            },
            {
              value: newApiToken.id,
              label: 'New',
              description: 'Save the new API Token',
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
  return (
    <DeleteModal
      {...props}
      entityType={'API Token'}
    >
      <SpaceBetween size={'xs'} direction={'vertical'}>
        <Alert type={'warning'}>
          <SpaceBetween size={'xs'} direction={'vertical'}>
            <Box>Deleting an API Token for an Guild Wars 2 Account which is used by an application <Box variant={'strong'}>will likely cause issues</Box> with the application(s) using it.</Box>
            <Box>If you wish to use a new API Token instead, <Box variant={'strong'}>please use the in-place update instead</Box> to prevent any issues.</Box>
          </SpaceBetween>
        </Alert>
        <Alert type={'info'}>
          <Box>Authorized applications may still be able to use an already issued API Token for at most 30 minutes after deletion of this API Token.</Box>
        </Alert>
      </SpaceBetween>
    </DeleteModal>
  );
}
