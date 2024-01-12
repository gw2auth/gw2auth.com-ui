import {
  Box, Popover, StatusIndicator, StatusIndicatorProps,
} from '@cloudscape-design/components';
import React from 'react';
import { VerificationStatus } from '../../lib/api/api.model';
import { RouterLink } from './router-link';

export function VerificationStatusIndicator({ status }: { status: VerificationStatus }) {
  const [type, text, popoverContent] = ({
    VERIFIED: [
      'success',
      'Verified',
      (
        <>
          <Box variant={'p'}>You completed the verification process for this Guild Wars 2 Account.</Box>
          <Box variant={'p'}>GW2Auth will not allow API Tokens of this Guild Wars 2 Account to be added to different GW2Auth Accounts.</Box>
        </>
      ),
    ],
    PENDING: [
      'pending',
      'Pending',
      (
        <>
          <Box variant={'p'}>You have submitted the verification for this Guild Wars 2 Account, but GW2Auth could not verify it yet.</Box>
          <Box variant={'p'}>Since the Guild Wars 2 API does not return real-time data, it might take some time until GW2Auth can complete the verification.</Box>
          <Box variant={'p'}>You can observe your pending verifications on the <RouterLink to={'/verification'}>verification page</RouterLink>.</Box>
        </>
      ),
    ],
    NONE: [
      'warning',
      'Unverified',
      (
        <>
          <Box variant={'p'}>This Guild Wars 2 Account is not verified yet.</Box>
          <Box variant={'p'}>Applications might request reading your verification status to ensure you are the legitimate owner of this Guild Wars 2 Account.</Box>
          <Box variant={'p'}>They might also refuse to accept this Guild Wars 2 Account until you have completed the verification process.</Box>
          <Box variant={'p'}>You can start the verification process on the <RouterLink to={'/verification'}>verification page</RouterLink>.</Box>
        </>
      ),
    ],
  } satisfies Record<VerificationStatus, [StatusIndicatorProps.Type, string, React.ReactNode]>)[status];

  return (
    <Popover
      triggerType={undefined}
      header={text}
      content={popoverContent}
      dismissButton={false}
    >
      <StatusIndicator type={type}>{text}</StatusIndicator>
    </Popover>
  );
}
