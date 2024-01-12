import { ColumnLayout, Popover, StatusIndicator } from '@cloudscape-design/components';
import React, { useMemo } from 'react';
import { Gw2ApiPermission } from '../../lib/api/api.model';
import { Gw2ApiPermissions } from '../common/gw2-api-permissions';
import { KeyValuePairs, ValueWithLabel } from '../common/key-value-pairs';

export function Scopes({ scopes }: { scopes: ReadonlyArray<string> }) {
  const sections = useMemo(() => {
    const requestedGw2ApiPermissions = scopes
      .filter((v) => v.startsWith('gw2:'))
      .map((v) => v.substring(4) as Gw2ApiPermission);

    const gw2AuthGroup: Array<React.ReactNode> = [(
      <Popover
        header={'Display Name'}
        content={'The custom name you have given a Guild Wars 2 Account at GW2Auth'}
        dismissButton={false}
      >
        <StatusIndicator type={'info'}>Display Name</StatusIndicator>
      </Popover>
    )];

    if (scopes.includes('gw2auth:verified')) {
      gw2AuthGroup.push((
        <Popover
          header={'Verification Status'}
          content={'The information whether a Guild Wars 2 Account is verified or not'}
          dismissButton={false}
        >
          <StatusIndicator type={'info'}>Verification Status</StatusIndicator>
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
        <ValueWithLabel label={'Guild Wars 2 API Access'}>
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
