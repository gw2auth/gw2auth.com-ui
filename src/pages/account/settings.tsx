import {
  Alert,
  Box, Button,
  ColumnLayout, ContentLayout, ExpandableSection, Header, Icon, Modal, SpaceBetween, StatusIndicator,
} from '@cloudscape-design/components';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { CustomTable } from '../../components/common/custom-table';
import { DeleteModal, DeleteModalProps } from '../../components/common/delete-modal';
import { Gw2AuthLogo } from '../../components/common/gw2auth-logo';
import { Hidden } from '../../components/common/hidden';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useAuthInfo, useMustAuthInfo } from '../../components/util/context/auth-info';
import { useHttpClient } from '../../components/util/context/http-client';
import { useDateFormat } from '../../components/util/state/use-dateformat';
import { expectSuccess } from '../../lib/api/api';
import {
  AccountFederation, AccountFederationSession, Issuer,
} from '../../lib/api/api.model';

export function Settings() {
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();

  const [isLoading, setLoading] = useState(false);
  const [federations, setFederations] = useState<ReadonlyArray<AccountFederation>>([]);
  const [sessions, setSessions] = useState<ReadonlyArray<AccountFederationSession>>([]);

  useEffect(() => {
    const all = federations.map((v) => `${v.issuer}|${v.idAtIssuer}`);
    setSessions((prev) => prev.filter((v) => all.includes(`${v.issuer}|${v.idAtIssuer}`)));
  }, [federations]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.getAccount());
      setFederations(body.federations);
      setSessions(body.sessions);
    })()
      .catch(catchNotify(notification, 'Failed to load account'))
      .finally(() => setLoading(false));
  }, [notification, apiClient]);

  return (
    <ContentLayout header={<Header variant={'h1'}>Settings</Header>}>
      <ColumnLayout columns={1}>
        <FederationsTable isLoading={isLoading} federations={federations} onUpdate={setFederations} />
        <SessionsTable isLoading={isLoading} sessions={sessions} onUpdate={setSessions} />
        <DeleteAccountSection />
      </ColumnLayout>
    </ContentLayout>
  );
}

function FederationsTable({ isLoading, federations, onUpdate }: { isLoading: boolean, federations: ReadonlyArray<AccountFederation>, onUpdate: React.Dispatch<React.SetStateAction<ReadonlyArray<AccountFederation>>> }) {
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();
  const authInfo = useMustAuthInfo();

  const [showAddFederationModal, setShowAddFederationModal] = useState(false);
  const [deleteModalItem, setDeleteModalItem] = useState<AccountFederation>();
  const [isDeleteLoading, setDeleteLoading] = useState(false);

  return (
    <>
      <Modal visible={showAddFederationModal} onDismiss={() => setShowAddFederationModal(false)} header={'Add Login Provider'}>
        <AddLoginProviderModalContent />
      </Modal>
      <FederationDeleteModal
        item={deleteModalItem}
        loading={isDeleteLoading}
        onDismiss={(e) => {
          if (e.detail.reason !== 'delete') {
            setDeleteModalItem(undefined);
            return;
          }

          const updateNotification = notification.add({
            type: 'in-progress',
            content: 'Deleting your Login Provider...',
            dismissible: false,
          });

          setDeleteLoading(true);
          (async () => {
            expectSuccess(await apiClient.deleteAccountFederation(e.detail.item.issuer, e.detail.item.idAtIssuer));

            updateNotification({
              type: 'success',
              content: 'Your Login Provider was deleted!',
              dismissible: true,
            });

            onUpdate((prev) => prev.filter((v) => v.issuer !== e.detail.item.issuer || v.idAtIssuer !== e.detail.item.idAtIssuer));
          })()
            .catch(catchNotify(updateNotification, 'Failed to delete login provider'))
            .finally(() => {
              setDeleteLoading(false);
              setDeleteModalItem(undefined);
            });
        }}
      />
      <CustomTable
        variant={'container'}
        loading={isLoading}
        columnDefinitions={[
          {
            id: 'issuer',
            header: 'Provider',
            cell: (v) => <IssuerLabel issuer={v.issuer} />,
            sortingField: 'issuer',
          },
          {
            id: 'id_at_issuer',
            header: 'ID at Provider',
            cell: (v) => <Hidden>{v.idAtIssuer}</Hidden>,
            sortingField: 'idAtIssuer',
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (v) => <Button
              variant={'inline-link'}
              iconName={'remove'}
              disabled={(isDeleteLoading && deleteModalItem !== undefined && (deleteModalItem.issuer !== v.issuer || deleteModalItem.idAtIssuer !== v.idAtIssuer)) || (v.issuer === authInfo.issuer && v.idAtIssuer === authInfo.idAtIssuer)}
              loading={isDeleteLoading && deleteModalItem !== undefined && deleteModalItem.issuer === v.issuer && deleteModalItem.idAtIssuer === v.idAtIssuer}
              onClick={() => setDeleteModalItem(v)}>Delete</Button>,
            alwaysVisible: true,
            preferencesDisable: true,
          },
        ]}
        items={federations}
        stickyColumns={{ first: 0, last: 1 }}
        filter={
          <Header
            counter={`(${federations.length})`}
            actions={<Button variant={'primary'} onClick={() => setShowAddFederationModal(true)}>Add Login Provider</Button>}
          >Login Providers</Header>
      }
      />
    </>
  );
}

function SessionsTable({ isLoading, sessions, onUpdate }: { isLoading: boolean, sessions: ReadonlyArray<AccountFederationSession>, onUpdate: React.Dispatch<React.SetStateAction<ReadonlyArray<AccountFederationSession>>> }) {
  const { formatDateTime } = useDateFormat();
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();
  const authInfo = useMustAuthInfo();

  const [deleteModalItem, setDeleteModalItem] = useState<string>();
  const [isDeleteLoading, setDeleteLoading] = useState(false);

  return (
    <>
      <SessionDeleteModal
        item={deleteModalItem}
        loading={isDeleteLoading}
        onDismiss={(e) => {
          if (e.detail.reason !== 'delete') {
            setDeleteModalItem(undefined);
            return;
          }

          const updateNotification = notification.add({
            type: 'in-progress',
            content: 'Deleting your Sessions...',
            dismissible: false,
          });

          setDeleteLoading(true);
          (async () => {
            expectSuccess(await apiClient.deleteAccountFederationSession(e.detail.item));

            updateNotification({
              type: 'success',
              content: 'Your Login Provider was deleted!',
              dismissible: true,
            });

            onUpdate((prev) => prev.filter((v) => v.id !== e.detail.item));
          })()
            .catch(catchNotify(updateNotification, 'Failed to delete session'))
            .finally(() => {
              setDeleteLoading(false);
              setDeleteModalItem(undefined);
            });
        }}
      />
      <CustomTable
        variant={'container'}
        loading={isLoading}
        columnDefinitions={[
          {
            id: 'current',
            header: 'Current',
            cell: (v) => {
              if (v.id !== authInfo.sessionId) {
                return undefined;
              }

              return <StatusIndicator type={'success'} />;
            },
            sortingComparator: (a, b) => {
              if (a.id === authInfo.sessionId) {
                return 1;
              }

              if (b.id === authInfo.sessionId) {
                return -1;
              }

              return 0;
            },
          },
          {
            id: 'id',
            header: 'ID',
            cell: (v) => <Hidden>{v.id}</Hidden>,
            sortingField: 'id',
          },
          {
            id: 'issuer',
            header: 'Provider',
            cell: (v) => <IssuerLabel issuer={v.issuer} />,
            sortingField: 'issuer',
          },
          {
            id: 'id_at_issuer',
            header: 'ID at Provider',
            cell: (v) => <Hidden>{v.idAtIssuer}</Hidden>,
            sortingField: 'idAtIssuer',
          },
          {
            id: 'creation_time',
            header: 'Created At',
            cell: (v) => formatDateTime(v.creationTime),
            sortingField: 'creationTime',
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (v) => <Button
              variant={'inline-link'}
              iconName={'remove'}
              disabled={(isDeleteLoading && deleteModalItem !== v.id) || v.id === authInfo.sessionId}
              loading={isDeleteLoading && deleteModalItem === v.id}
              onClick={() => setDeleteModalItem(v.id)}>Delete</Button>,
            alwaysVisible: true,
            preferencesDisable: true,
          },
        ]}
        items={sessions}
        stickyColumns={{ first: 0, last: 1 }}
        visibleColumns={['current', 'issuer', 'id_at_issuer', 'creation_time', 'details']}
        filter={<Header counter={`(${sessions.length})`}>Sessions</Header>}
      />
    </>
  );
}

function DeleteAccountSection() {
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();
  const [, setAuthInfo] = useAuthInfo();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setLoading] = useState(false);

  return (
    <>
      <DeleteModal
        entityType={'GW2Auth Account'}
        loading={isLoading}
        item={showDeleteModal ? true : undefined}
        onDismiss={(e) => {
          if (e.detail.reason !== 'delete') {
            setShowDeleteModal(false);
            return;
          }

          const updateNotification = notification.add({
            type: 'in-progress',
            content: 'Deleting your GW2Auth Account...',
            dismissible: false,
          });

          setLoading(true);
          (async () => {
            expectSuccess(await apiClient.deleteAccount());

            updateNotification({
              type: 'success',
              content: 'Your GW2Auth Account was deleted!',
              dismissible: true,
            });

            setAuthInfo(null);
          })()
            .catch(catchNotify(updateNotification, 'Failed to delete GW2Auth Account'))
            .finally(() => {
              setLoading(false);
              setShowDeleteModal(false);
            });
        }}
      >
        <SpaceBetween size={'xs'} direction={'vertical'}>
          <Alert type={'error'}>
            <SpaceBetween size={'xs'} direction={'vertical'}>
              <Box>This GW2Auth will be deleted immediately</Box>
              <Box><Box variant={'strong'}>This action is not reversible!</Box> Use it with caution.</Box>
            </SpaceBetween>
          </Alert>
        </SpaceBetween>
      </DeleteModal>
      <ExpandableSection headerText={'Danger Zone'} variant={'container'}>
        <Alert type={'error'}>
          <ColumnLayout columns={1}>
            <Box fontSize={'heading-l'}>This action <Box fontSize={'heading-l'} variant={'strong'}>IS NOT REVERSIBLE</Box></Box>
            <Button iconName={'remove'} onClick={() => setShowDeleteModal(true)}>Delete this GW2Auth Account</Button>
          </ColumnLayout>
        </Alert>
      </ExpandableSection>
    </>
  );
}

function IssuerLabel({ issuer }: { issuer: Issuer }) {
  const icon = ({
    [Issuer.GITHUB]: <FontAwesomeIcon icon={faGithub} />,
    [Issuer.GOOGLE]: <FontAwesomeIcon icon={faGoogle} />,
    [Issuer.COGNITO]: <Icon svg={<Gw2AuthLogo inverse={true} />} />,
  })[issuer] ?? <Icon name={'status-warning'} />;

  const name = ({
    [Issuer.GITHUB]: 'GitHub',
    [Issuer.GOOGLE]: 'Google',
    [Issuer.COGNITO]: 'E-Mail & Password',
  })[issuer] ?? 'UNKNOWN';

  return (
    <Box>{icon} {name}</Box>
  );
}

function AddLoginProviderModalContent() {
  return (
    <ColumnLayout columns={1}>
      <Button iconSvg={<FontAwesomeIcon icon={faGithub} />} variant={'primary'} fullWidth={true} href={'/api/account/federation/github'}>GitHub</Button>
      <Button iconSvg={<FontAwesomeIcon icon={faGoogle} />} variant={'primary'} fullWidth={true} href={'/api/account/federation/google'}>Google</Button>
      <Button iconSvg={<Gw2AuthLogo />} variant={'primary'} fullWidth={true} href={'/api/account/federation/cognito'}> E-Mail & Password</Button>
    </ColumnLayout>
  );
}

function FederationDeleteModal(props: Omit<DeleteModalProps<AccountFederation>, 'entityType'>) {
  return (
    <DeleteModal
      {...props}
      entityType={'Login Provider'}
    >
    </DeleteModal>
  );
}

function SessionDeleteModal(props: Omit<DeleteModalProps<string>, 'entityType'>) {
  return (
    <DeleteModal
      {...props}
      entityType={'Session'}
    >
    </DeleteModal>
  );
}
