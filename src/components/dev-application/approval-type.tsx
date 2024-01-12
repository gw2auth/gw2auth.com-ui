import { Popover, StatusIndicator, StatusIndicatorProps } from '@cloudscape-design/components';
import React from 'react';

export function ApprovalType({ requiresApproval }: { requiresApproval: boolean }) {
  const [type, text, detail] = ({
    0: ['info', 'Public', 'Users will be automatically approved on their first login'],
    1: ['success', 'Requires approval', 'Logins will be rejected until the user was approved by you'],
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
