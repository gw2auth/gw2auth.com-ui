import {
  Box, Button, ColumnLayout, Container, ContentLayout, Header,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { CustomTable } from '../../components/common/custom-table';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { useI18n } from '../../components/util/context/i18n';
import { VerificationSelection } from '../../components/verification/verification-wizard';
import { expectSuccess } from '../../lib/api/api';
import { VerificationPendingChallenge } from '../../lib/api/api.model';

export function Gw2AccountVerification() {
  const navigate = useNavigate();
  const proceedHref = useHref('/verification/new');

  return (
    <ContentLayout header={<Header variant={'h1'}>Guild Wars 2 Account Verification</Header>}>
      <ColumnLayout columns={1}>
        <Container header={<Header>New Verification</Header>}>
          <VerificationSelection onContinue={() => navigate(proceedHref)} />
        </Container>
        <PendingChallengesTable />
      </ColumnLayout>
    </ContentLayout>
  );
}

function PendingChallengesTable() {
  const i18n = useI18n();
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();

  const [isLoading, setLoading] = useState(false);
  const [pendingChallenges, setPendingChallenges] = useState<ReadonlyArray<VerificationPendingChallenge>>([]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.getVerificationPendingChallenges());
      setPendingChallenges(body);
    })()
      .catch(catchNotify(notification, 'Failed to load pending challenges'))
      .finally(() => setLoading(false));
  }, [notification, apiClient]);

  function onCancelled(gw2AccountId: string) {
    setPendingChallenges((prev) => prev.filter((v) => v.gw2AccountId !== gw2AccountId));
  }

  return (
    <CustomTable
      variant={'stacked'}
      loading={isLoading}
      columnDefinitions={[
        {
          id: 'gw2_account_id',
          header: 'GW2 Account ID',
          cell: (v) => <Box variant={'samp'}>{v.gw2AccountId}</Box>,
          sortingField: 'gw2AccountId',
        },
        {
          id: 'gw2_account_name',
          header: 'Name',
          cell: (v) => v.gw2AccountName,
          sortingField: 'gw2AccountName',
        },
        {
          id: 'gw2_account_display_name',
          header: 'Display Name',
          cell: (v) => v.gw2AccountDisplayName,
          sortingField: 'gw2AccountDisplayName',
        },
        {
          id: 'challenge_name',
          header: 'Challenge',
          cell: (v) => challengeName(v.challengeId),
          sortingField: 'challengeId',
        },
        {
          id: 'challenge_description',
          header: 'Description',
          cell: (v) => v.state,
        },
        {
          id: 'creation_time',
          header: 'Created At',
          cell: (v) => i18n.dateTime(new Date(v.creationTime)),
          sortingField: 'creationTime',
        },
        {
          id: 'submit_time',
          header: 'Submitted At',
          cell: (v) => i18n.dateTime(new Date(v.submitTime)),
          sortingField: 'submitTime',
        },
        {
          id: 'timeout_time',
          header: 'Timeout At',
          cell: (v) => i18n.dateTime(new Date(v.timeoutTime)),
          sortingField: 'timeoutTime',
        },
        {
          id: 'actions',
          header: 'Actions',
          cell: (v) => <CancelPendingChallengeButton gw2AccountId={v.gw2AccountId} onCancelled={onCancelled} />,
          alwaysVisible: true,
          preferencesDisable: true,
        },
      ]}
      visibleColumns={['gw2_account_display_name', 'challenge_name', 'submit_time', 'timeout_time', 'actions']}
      stickyColumns={{ first: 0, last: 1 }}
      items={pendingChallenges}
      filter={<Header counter={`(${pendingChallenges.length})`}>Pending Verifications</Header>}
      empty={<Box variant={'h5'}>No pending verifications</Box>}
    />
  );
}

function CancelPendingChallengeButton({ gw2AccountId, onCancelled }: { gw2AccountId: string, onCancelled: (id: string) => void }) {
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();

  const [isLoading, setLoading] = useState(false);

  function onClick() {
    const updateNotification = notification.add({
      type: 'in-progress',
      content: 'Cancelling verification...',
      dismissible: false,
    });

    setLoading(true);
    (async () => {
      expectSuccess(await apiClient.cancelPendingChallenge(gw2AccountId));
      updateNotification({
        type: 'success',
        content: 'Verification cancelled',
        dismissible: true,
      });

      onCancelled(gw2AccountId);
    })()
      .catch(catchNotify(updateNotification, 'Failed to cancel challenge'))
      .finally(() => setLoading(false));
  }

  return (
    <Button variant={'inline-link'} loading={isLoading} onClick={onClick}>Cancel</Button>
  );
}

function challengeName(challengeId: number): string {
  switch (challengeId) {
    case 1:
      return 'API Token Name';

    case 2:
      return 'TP Buy-Order';

    case 3:
      return 'Character Name';

    default:
      throw new Error('invalid challenge id');
  }
}
