import {
  Popover, StatusIndicator, StatusIndicatorProps,
} from '@cloudscape-design/components';
import React from 'react';
import { VerificationStatus } from '../../lib/api/api.model';
import { useI18n } from '../util/context/i18n';
import { RouterLink } from './router-link';

export function VerificationStatusIndicator({ status }: { status: VerificationStatus }) {
  const i18n = useI18n();
  const [type, text, popoverContent] = ({
    VERIFIED: [
      'success',
      i18n.components.verificationStatus.verified.label,
      i18n.components.verificationStatus.verified.content,
    ],
    PENDING: [
      'pending',
      i18n.components.verificationStatus.pending.label,
      i18n.components.verificationStatus.pending.content(({ children }) => <RouterLink to={'/verification'}>{children}</RouterLink>),
    ],
    NONE: [
      'warning',
      i18n.components.verificationStatus.unverified.label,
      i18n.components.verificationStatus.unverified.content(({ children }) => <RouterLink to={'/verification'}>{children}</RouterLink>),
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
