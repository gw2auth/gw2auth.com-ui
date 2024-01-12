import {
  Box, ContentLayout, Header, Input, SpaceBetween, TableProps,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { useHref } from 'react-router-dom';
import { CustomTable, CustomTableColumnDefinition } from '../../components/common/custom-table';
import { Gw2ApiToken } from '../../components/common/hidden';
import { RouterInlineLink } from '../../components/common/router-link';
import { VerificationStatusIndicator } from '../../components/common/verification-status';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { useI18n } from '../../components/util/context/i18n';
import { expectSuccess } from '../../lib/api/api';
import { Gw2AccountListItem } from '../../lib/api/api.model';
import { I18nFormats } from '../../lib/i18n/i18n-strings';

function visibleByDefault(id: string): boolean {
  return id !== 'id' && id !== 'name' && id !== 'api_token';
}

function buildColumnDefinitions(i18n: I18nFormats) {
  const accountDetailBaseHref = useHref('/accounts');
  const displayNameColumn = {
    id: 'display_name',
    header: 'Display Name',
    cell: (v) => v.displayName,
    sortingField: 'displayName',
    editConfig: {
      editingCell(item: Gw2AccountListItem, { currentValue, setValue }: TableProps.CellContext<string>) {
        return (
          <Input
            autoFocus={true}
            value={currentValue ?? item.displayName}
            onChange={(e) => {
              setValue(e.detail.value);
            }}
          />
        );
      },
    },
  } satisfies CustomTableColumnDefinition<Gw2AccountListItem>;

  const defs = [
    {
      id: 'id',
      header: 'ID',
      cell: (v) => <Box fontSize={'body-s'} variant={'samp'}>{v.id}</Box>,
      sortingField: 'id',
    },
    {
      id: 'name',
      header: 'Name',
      cell: (v) => v.name,
      sortingField: 'name',
    },
    displayNameColumn,
    {
      id: 'verification_status',
      header: 'Verification Status',
      cell: (v) => <VerificationStatusIndicator status={v.verificationStatus} />,
      sortingField: 'verificationStatus',
    },
    {
      id: 'authorized_apps',
      header: 'Authorized Applications',
      cell: (v) => v.authorizedApps,
      sortingField: 'authorizedApps',
    },
    {
      id: 'api_token',
      header: 'API Token',
      cell: (v) => <Gw2ApiToken value={v.apiToken} />,
      sortingField: 'apiToken',
    },
    {
      id: 'creation_time',
      header: 'Created',
      cell: (v) => i18n.dateTime(new Date(v.creationTime)),
      sortingField: 'creationTime',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (v) => <RouterInlineLink to={`${accountDetailBaseHref}/${encodeURIComponent(v.id)}`}>Details</RouterInlineLink>,
      alwaysVisible: true,
      preferencesDisable: true,
    },
  ] satisfies Array<CustomTableColumnDefinition<Gw2AccountListItem>>;

  return {
    displayNameColumn: displayNameColumn,
    columnDefinitions: defs,
  };
}

export function Gw2Accounts() {
  const i18n = useI18n();
  const { displayNameColumn, columnDefinitions } = buildColumnDefinitions(i18n);
  const visibleColumns = columnDefinitions.map((v) => v.id).filter(visibleByDefault);

  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const [isLoading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<Gw2AccountListItem>>([]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const resp = expectSuccess(await apiClient.getGw2Accounts());
      setItems(resp.body);
    })()
      .catch(catchNotify(notification, 'Failed to load your Guild Wars 2 Accounts'))
      .finally(() => setLoading(false));
  }, [apiClient, notification]);

  return (
    <ContentLayout header={<Header variant={'h1'}>Guild Wars 2 Accounts</Header>}>
      <CustomTable
        items={items}
        loading={isLoading}
        loadingText={i18n.loading}
        variant={'container'}
        columnDefinitions={columnDefinitions}
        visibleColumns={visibleColumns}
        stickyColumns={{ first: 0, last: 1 }}
        filter={<TableHeader count={items.length} />}// slot usually used for filter
        submitEdit={async (item, column, newValue) => {
          try {
            if (column === displayNameColumn) {
              expectSuccess(await apiClient.updateGw2Account(item.id, newValue as string));

              setItems((prev) => prev.map((v) => {
                if (v.id !== item.id) {
                  return v;
                }

                return { ...v, displayName: newValue as string };
              }));
            }
          } catch (e) {
            catchNotify(notification, 'Failed to update your Guild Wars 2 Account')(e);
            throw new Error();// throw error so cloudscape doesnt render it as success
          }
        }}
        empty={
          <SpaceBetween size={'m'} direction={'vertical'} alignItems={'center'}>
            <Box variant={'h5'}>No Guild Wars 2 Accounts added yet</Box>
            <RouterInlineLink to={useHref('/accounts/add')} variant={'normal'}>Add API Token</RouterInlineLink>
          </SpaceBetween>
        }
      />
    </ContentLayout>
  );
}

function TableHeader({ count }: { count: number }) {
  return (
    <Header
      counter={`(${count})`}
      actions={<RouterInlineLink to={useHref('/accounts/add')} variant={'primary'}>Add API Token</RouterInlineLink>}
    >Accounts</Header>
  );
}
