import { ColumnLayout, Popover, StatusIndicator } from '@cloudscape-design/components';
import React, { useMemo } from 'react';
import { Gw2ApiPermission } from '../../lib/api/api.model';
import { Gw2ApiPermissions } from '../common/gw2-api-permissions';
import { KeyValuePairs, ValueWithLabel } from '../common/key-value-pairs';
import { useI18n } from '../util/context/i18n';

export function Scopes({ scopes }: { scopes: ReadonlyArray<string> }) {
  const i18n = useI18n();
  const sections = useMemo(() => {
    const requestedGw2ApiPermissions = scopes
      .filter((v) => v.startsWith('gw2:'))
      .map((v) => v.substring(4) as Gw2ApiPermission);

    const gw2AuthGroup: Array<React.ReactNode> = [(
      <Popover
        header={i18n.components.scopes.displayName.label}
        content={i18n.components.scopes.displayName.description}
        dismissButton={false}
      >
        <StatusIndicator type={'info'}>{i18n.components.scopes.displayName.label}</StatusIndicator>
      </Popover>
    )];

    if (scopes.includes('gw2auth:verified')) {
      gw2AuthGroup.push((
        <Popover
          header={i18n.components.scopes.verificationStatus.label}
          content={i18n.components.scopes.verificationStatus.description}
          dismissButton={false}
        >
          <StatusIndicator type={'info'}>{i18n.components.scopes.verificationStatus.label}</StatusIndicator>
        </Popover>
      ));
    }

    return [
      (
        <ValueWithLabel label={'GW2Auth'}>
          <ColumnLayout columns={gw2AuthGroup.length}>
            {...gw2AuthGroup}
          </ColumnLayout>
        </ValueWithLabel>
      ),
      (
        <ValueWithLabel label={i18n.components.scopes.gw2ApiAccess.label}>
          <Gw2ApiPermissions permissions={requestedGw2ApiPermissions} />
        </ValueWithLabel>
      ),
    ];
  }, [scopes]);

  return (
    <KeyValuePairs columns={2}>
      {...sections}
    </KeyValuePairs>
  );
}
