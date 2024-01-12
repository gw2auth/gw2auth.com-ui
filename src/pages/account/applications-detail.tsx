import {
  Alert, Box, Button, ColumnLayout, Container, ContentLayout, Header, Spinner, StatusIndicator,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { useHref, useNavigate, useParams } from 'react-router-dom';
import { Copy } from '../../components/common/copy';
import { CustomTable } from '../../components/common/custom-table';
import { DeleteModal, DeleteModalProps } from '../../components/common/delete-modal';
import { KeyValuePairs, ValueWithLabel } from '../../components/common/key-value-pairs';
import { RouterInlineLink } from '../../components/common/router-link';
import { Scopes } from '../../components/scopes/scopes';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { useI18n } from '../../components/util/context/i18n';
import { expectSuccess } from '../../lib/api/api';
import { Application } from '../../lib/api/api.model';

export function ApplicationsDetail() {
  const { id } = useParams();
  if (id === undefined) {
    throw new Error();
  }

  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [application, setApplication] = useState<Application>();
  const [showRevokeAccessModal, setShowRevokeAccessModal] = useState(false);
  const [revokeAccessLoading, setRevokeAccessLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.getApplication(id));
      setApplication(body);
    })()
      .catch(catchNotify(notification, 'Failed to load application'))
      .finally(() => setLoading(false));
  }, [apiClient, id, notification]);

  let overview: React.ReactNode;
  let authorizedScopes: React.ReactNode;
  let gw2Accounts: React.ReactNode;
  if (isLoading) {
    overview = <Spinner size={'large'} />;
    authorizedScopes = <Container variant={'stacked'}><Spinner size={'large'} /></Container>;
    gw2Accounts = <Container variant={'stacked'}><Spinner size={'large'} /></Container>;
  } else if (application === undefined) {
    overview = <Box>Failed to load</Box>;
    authorizedScopes = <Container variant={'stacked'}><Box>Failed to load</Box></Container>;
    gw2Accounts = <Container variant={'stacked'}><Box>Failed to load</Box></Container>;
  } else {
    overview = <Overview id={id} application={application} />;
    authorizedScopes = <AuthorizedScopes application={application} />;
    gw2Accounts = <Gw2Accounts application={application} />;
  }

  return (
    <>
      <RevokeAccessModal
        item={showRevokeAccessModal ? id : undefined}
        loading={revokeAccessLoading}
        onDismiss={(e) => {
          if (e.detail.reason !== 'delete') {
            setShowRevokeAccessModal(false);
            return;
          }

          const updateNotification = notification.add({
            type: 'in-progress',
            content: 'Revoking access...',
            dismissible: false,
          });

          setRevokeAccessLoading(true);
          (async () => {
            expectSuccess(await apiClient.revokeApplicationAccess(e.detail.item));

            updateNotification({
              type: 'success',
              content: 'Access was revoked',
              dismissible: true,
            });
            navigate('/applications');
          })()
            .catch(catchNotify(updateNotification, 'Failed to revoke access'))
            .finally(() => {
              setRevokeAccessLoading(false);
              setShowRevokeAccessModal(false);
            });
        }}
      />
      <ContentLayout
        header={
          <Header
            variant={'h1'}
            actions={<Button loading={revokeAccessLoading} onClick={() => setShowRevokeAccessModal(true)}>Revoke Access</Button>}
          >{application?.displayName ?? id}</Header>
        }
      >
        <ColumnLayout columns={1}>
          <Container variant={'stacked'}>{overview}</Container>
          {authorizedScopes}
          {gw2Accounts}
        </ColumnLayout>
      </ContentLayout>
    </>
  );
}

function Overview({ id, application }: { id: string, application: Application }) {
  const i18n = useI18n();

  return (
    <KeyValuePairs columns={2}>
      <ValueWithLabel label={'User ID'}>
        <Copy copyText={id}><Box variant={'samp'} fontSize={'body-s'}>{application.userId}</Box></Copy>
      </ValueWithLabel>
      <ValueWithLabel label={'Last Used'}>
        <Box>{application.lastUsed !== undefined ? i18n.dateTime(new Date(application.lastUsed)) : <StatusIndicator type={'info'}>Never</StatusIndicator>}</Box>
      </ValueWithLabel>
    </KeyValuePairs>
  );
}

function AuthorizedScopes({ application }: { application: Application }) {
  return (
    <Container variant={'stacked'} header={<Header counter={`(${application.authorizedScopes.length})`}>Authorized Scopes</Header>}>
      <Scopes scopes={application.authorizedScopes} />
    </Container>
  );
}

function Gw2Accounts({ application }: { application: Application }) {
  const baseHref = useHref('/accounts');

  return (
    <CustomTable
      variant={'stacked'}
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (v) => v.name,
          sortingField: 'name',
        },
        {
          id: 'display_name',
          header: 'Display Name',
          cell: (v) => v.displayName,
          sortingField: 'displayName',
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
      items={application.authorizedGw2Accounts}
      filter={
        <Header counter={`(${application.authorizedGw2Accounts.length})`}>Authorized Guild Wars 2 Accounts</Header>
      }
      empty={<Box variant={'h5'}>No accounts authorized</Box>}
    />
  );
}

function RevokeAccessModal(props: Omit<DeleteModalProps<string>, 'entityType'>) {
  return (
    <DeleteModal
      {...props}
      entityType={'Authorized Application'}
    >
      <Alert type={'info'}>
        <Box>Authorized applications may still be able to use an already issued API Token for at most 30 minutes after deletion of this authorization.</Box>
      </Alert>
    </DeleteModal>
  );
}
