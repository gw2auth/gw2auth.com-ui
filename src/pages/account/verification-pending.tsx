import React from 'react';
import { useHref, useNavigate, useSearchParams } from 'react-router-dom';
import { PendingChallengeWizard } from '../../components/verification/verification-wizard';

export function Gw2AccountVerificationPending() {
  const [query] = useSearchParams();
  const challengeId = Number.parseInt(query.get('challengeId')!, 10);
  const state = query.get('state')!;

  const navigate = useNavigate();
  const parentHref = useHref('/verification');

  return (
    <PendingChallengeWizard challengeId={challengeId} state={state} onDismiss={() => navigate(parentHref)} />
  );
}
