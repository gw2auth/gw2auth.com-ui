import { Popover, StatusIndicator, StatusIndicatorProps } from '@cloudscape-design/components';
import React from 'react';
import { useI18n } from '../util/context/i18n';

export function ApprovalType({ requiresApproval }: { requiresApproval: boolean }) {
  const i18n = useI18n();
  const [type, text, detail] = ({
    0: ['info', i18n.components.devAppApprovalType._public.label, i18n.components.devAppApprovalType._public.detail],
    1: ['success', i18n.components.devAppApprovalType.required.label, i18n.components.devAppApprovalType.required.detail],
  } satisfies Record<0 | 1, [StatusIndicatorProps.Type, string, string]>)[requiresApproval ? 1 : 0];

  return (
    <Popover
      dismissButton={false}
      position={'top'}
      size={'small'}
      content={detail}
    >
      <StatusIndicator type={type} wrapText={false}>{text}</StatusIndicator>
    </Popover>
  );
}
