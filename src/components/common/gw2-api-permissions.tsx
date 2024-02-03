import { ColumnLayout, Popover, StatusIndicator } from '@cloudscape-design/components';
import React, { useMemo } from 'react';
import { AllGw2ApiPermissions, Gw2ApiPermission } from '../../lib/api/api.model';
import { useI18n } from '../util/context/i18n';

export function Gw2ApiPermissions({ permissions }: { permissions: readonly Gw2ApiPermission[] }) {
  const badges = useMemo(() => {
    const r: React.ReactNode[] = [];
    for (const perm of AllGw2ApiPermissions) {
      if (permissions.includes(perm)) {
        r.push(<Gw2ApiPermissionBadge permission={perm} />);
      }
    }

    return r;
  }, [AllGw2ApiPermissions, permissions]);

  return (
    <ColumnLayout columns={permissions.length}>
      {...badges}
    </ColumnLayout>
  );
}

export function Gw2ApiPermissionBadge({ permission }: { permission: Gw2ApiPermission }) {
  const i18n = useI18n();
  return (
    <Popover
      triggerType={undefined}
      position={'top'}
      header={permission}
      content={i18n.gw2.permissionDescription(permission)}
      dismissButton={false}
    >
      <StatusIndicator type={'success'}>{permission}</StatusIndicator>
    </Popover>
  );
}
