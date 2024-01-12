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
  SpaceBetween,
  Spinner,
} from '@cloudscape-design/components';
import React, { useEffect, useMemo, useState } from 'react';
import {
  useHref, useLocation, useNavigate, useParams,
} from 'react-router-dom';
import { Copy, CopyButton } from '../../components/common/copy';
import {
  ConfirmationModal,
  ConfirmationModalProps,
  DeleteModal,
  DeleteModalProps,
} from '../../components/common/delete-modal';
import { KeyValuePairs, ValueWithLabel } from '../../components/common/key-value-pairs';
import { RouterInlineLink } from '../../components/common/router-link';
import { ApprovalType } from '../../components/dev-application/approval-type';
import { RedirectURIsEditor } from '../../components/dev-application/redirect-uris-editor';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { useI18n } from '../../components/util/context/i18n';
import { expectSuccess } from '../../lib/api/api';
import { DevApplicationClient } from '../../lib/api/api.model';

export function DevApplicationsClientsDetail() {
  const { applicationId, clientId } = useParams();
  if (applicationId === undefined || clientId === undefined) {
    throw Error();
  }

  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();
  const navigate = useNavigate();
  const applicationHref = useHref(`/dev/applications/${encodeURIComponent(applicationId)}`);
  const testHref = useHref(`${applicationHref}/clients/${clientId}/test`);
  const testCallbackHref = useTestCallbackHref();

  const [isLoading, setLoading] = useState(false);
  const [devApplicationClient, setDevApplicationClient] = useState<DevApplicationClient>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.getDevApplicationClient(applicationId, clientId));
      setDevApplicationClient(body);
    })()
      .catch(catchNotify(notification, 'Failed to load client'))
      .finally(() => setLoading(false));
  }, [applicationId, clientId, apiClient]);

  let overview: React.ReactNode;
  let content: React.ReactNode;
  if (isLoading) {
    overview = <Spinner size={'large'} />;
    content = <Spinner size={'large'} />;
  } else if (devApplicationClient === undefined) {
    overview = <Box>Failed to load</Box>;
    content = <Box>Failed to load</Box>;
  } else {
    overview = <Overview id={clientId} devApplicationClient={devApplicationClient} />;
    content = <Content
      applicationId={applicationId}
      clientId={clientId}
      devApplicationClient={devApplicationClient}
      onUpdate={setDevApplicationClient}
    />;
  }

  return (
    <>
      <ClientDeleteModal
        item={showDeleteModal ? [applicationId, clientId] : undefined}
        loading={deleteLoading}
        onDismiss={(e) => {
          if (e.detail.reason !== 'delete') {
            setShowDeleteModal(false);
            return;
          }

          const updateNotification = notification.add({
            type: 'in-progress',
            content: 'Deleting your client...',
            dismissible: false,
          });

          setDeleteLoading(true);
          (async () => {
            const { item } = e.detail;
            expectSuccess(await apiClient.deleteDevApplicationClient(item[0], item[1]));

            updateNotification({
              type: 'success',
              content: 'Your client was deleted',
              dismissible: true,
            });
            navigate(applicationHref);
          })()
            .catch(catchNotify(updateNotification, 'Failed to delete client'))
            .finally(() => {
              setDeleteLoading(false);
              setShowDeleteModal(false);
            });
        }}
      />
      <ContentLayout
        header={
          <Header
            variant={'h1'}
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <RouterInlineLink to={testHref} variant={'normal'} disabled={!devApplicationClient?.redirectURIs?.includes(testCallbackHref)}>Test</RouterInlineLink>
                <Button loading={deleteLoading} onClick={() => setShowDeleteModal(true)}>Delete</Button>
              </SpaceBetween>
            }
          >{devApplicationClient?.displayName ?? clientId}</Header>
        }
      >
        <ColumnLayout columns={1}>
          <Container variant={'stacked'}>{overview}</Container>
          <Container variant={'stacked'}>{content}</Container>
        </ColumnLayout>
      </ContentLayout>
    </>
  );
}

function Overview({ id, devApplicationClient }: { id: string; devApplicationClient: DevApplicationClient }) {
  const i18n = useI18n();

  return (
    <KeyValuePairs columns={3}>
      <ValueWithLabel label={'ID'}>
        <Copy copyText={id}><Box variant={'samp'} fontSize={'body-s'}>{id}</Box></Copy>
      </ValueWithLabel>
      <ValueWithLabel label={'Name'}>
        <Box>{devApplicationClient.displayName}</Box>
      </ValueWithLabel>
      <ValueWithLabel label={'Created'}>
        <Box>{i18n.dateTime(new Date(devApplicationClient.creationTime))}</Box>
      </ValueWithLabel>
      <ValueWithLabel label={'API Version'}>
        <Box variant={'samp'} fontSize={'body-s'}>{devApplicationClient.apiVersion}</Box>
      </ValueWithLabel>
      <ValueWithLabel label={'Type'}>
        <Box variant={'samp'} fontSize={'body-s'}>{devApplicationClient.type}</Box>
      </ValueWithLabel>
      <ValueWithLabel label={'Approval Type'}>
        <ApprovalType requiresApproval={devApplicationClient.requiresApproval} />
      </ValueWithLabel>
    </KeyValuePairs>
  );
}

function Content({
  applicationId, clientId, devApplicationClient, onUpdate,
}: { applicationId: string; clientId: string; devApplicationClient: DevApplicationClient, onUpdate: (v: DevApplicationClient) => void }) {
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();

  const [clientSecret, setClientSecret] = useState('');
  const [clientSecretLoading, setClientSecretLoading] = useState(false);
  const [showClientSecretModal, setShowClientSecretModal] = useState(false);
  const hasClientSecret = useMemo(() => clientSecret !== '', [clientSecret]);

  const [redirectURIs, setRedirectURIs] = useState(devApplicationClient.redirectURIs);
  const [redirectURIsLoading, setRedirectURIsLoading] = useState(false);
  const [redirectURIsEditing, setRedirectURIsEditing] = useState(false);
  const redirectURIsDisabled = useMemo(() => redirectURIsLoading || !redirectURIsEditing, [redirectURIsLoading, redirectURIsEditing]);

  function onEditCancelClick() {
    setRedirectURIs(devApplicationClient.redirectURIs);
    setRedirectURIsEditing(false);
  }

  function onEditSaveClick() {
    if (!redirectURIsEditing) {
      setRedirectURIsEditing(true);
      return;
    }

    setRedirectURIsLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.updateDevApplicationClientRedirectURIs(applicationId, clientId, redirectURIs));
      if (body) {
        onUpdate({
          ...devApplicationClient,
          redirectURIs: redirectURIs,
        });
      } else {
        setRedirectURIs(devApplicationClient.redirectURIs);
      }
    })()
      .catch((e) => {
        setRedirectURIs(devApplicationClient.redirectURIs);
        catchNotify(notification, 'Failed to update Redirect URIs')(e);
      })
      .finally(() => {
        setRedirectURIsLoading(false);
        setRedirectURIsEditing(false);
      });
  }

  return (
    <>
      <SecretRegenerateModal
        item={showClientSecretModal ? [applicationId, clientId] : undefined}
        loading={clientSecretLoading}
        onDismiss={(e) => {
          if (e.detail.reason !== 'confirm') {
            setShowClientSecretModal(false);
            return;
          }

          setClientSecretLoading(true);
          (async () => {
            const { item } = e.detail;
            const { body } = expectSuccess(await apiClient.regenerateDevApplicationClientSecret(item[0], item[1]));
            setClientSecret(body.clientSecret);
          })()
            .catch(catchNotify(notification, 'Failed to regenerate client secret'))
            .finally(() => {
              setShowClientSecretModal(false);
              setClientSecretLoading(false);
            });
        }}
      />
      <SpaceBetween size={'xxl'} direction={'vertical'}>
        <FormField
          label={<Header variant={'h2'}>Client Secret</Header>}
          description={'Used for authenticated OAuth2 requests'}
          secondaryControl={
            hasClientSecret
              ? <CopyButton copyText={clientSecret} />
              : <Button iconName={'redo'} loading={clientSecretLoading} onClick={() => setShowClientSecretModal(true)} />
          }
        >
          <Input value={'abcdefghijklmnopqrstuvwxyz'} type={'password'} disabled={true} disableBrowserAutocorrect={true} />
        </FormField>

        <FormField
          label={<Header variant={'h2'}>Redirect URIs</Header>}
          description={'Only URIs listed here are allowed to be used as the redirect URI for OAuth2 authorization requests'}
          secondaryControl={
            <SpaceBetween size={'xs'} direction={'horizontal'}>
              <Button disabled={!redirectURIsEditing} onClick={onEditCancelClick}>Cancel</Button>
              <Button loading={redirectURIsLoading} onClick={onEditSaveClick}>{redirectURIsEditing ? 'Save' : 'Edit'}</Button>
            </SpaceBetween>
          }
        >
          <RedirectURIsEditor
            applicationId={applicationId}
            clientId={clientId}
            disabled={redirectURIsDisabled}
            items={redirectURIs}
            setItems={setRedirectURIs}
          />
        </FormField>
      </SpaceBetween>
    </>
  );
}

function ClientDeleteModal(props: Omit<DeleteModalProps<[string, string]>, 'entityType'>) {
  return (
    <DeleteModal
      {...props}
      entityType={'Client'}
    >
      <SpaceBetween size={'xs'} direction={'vertical'}>
        <Alert type={'warning'}>
          <SpaceBetween size={'xs'} direction={'vertical'}>
            <Box>This client will immediately stop working upon deletion.</Box>
            <Box><Box variant={'strong'}>This action is not reversible!</Box> Use it with caution.</Box>
          </SpaceBetween>
        </Alert>
      </SpaceBetween>
    </DeleteModal>
  );
}

function SecretRegenerateModal(props: Omit<ConfirmationModalProps<[string, string]>, 'header' | 'confirmLong' | 'confirmShort'>) {
  return (
    <ConfirmationModal
      {...props}
      header={'Confirm regeneration of Client Secret'}
      confirmLong={'I have read the above'}
      confirmShort={'Confirm'}
    >
      <SpaceBetween size={'xs'} direction={'vertical'}>
        <Alert type={'warning'}>
          <SpaceBetween size={'xs'} direction={'vertical'}>
            <Box>All authenticated requests using this client will immediately stop working until you update your software configuration to use the new client secret.</Box>
            <Box><Box variant={'strong'}>This action is not reversible!</Box> Use it with caution.</Box>
          </SpaceBetween>
        </Alert>
      </SpaceBetween>
    </ConfirmationModal>
  );
}

function useTestCallbackHref() {
  const location = useLocation();
  return useMemo(() => `${window.location.protocol}//${window.location.host}${location.pathname}/test/callback`, [location]);
}
