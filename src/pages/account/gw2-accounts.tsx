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
import { useDateFormat } from '../../components/util/state/use-dateformat';
import { expectSuccess } from '../../lib/api/api';
import { Gw2AccountListItem } from '../../lib/api/api.model';
import { I18nFormats } from '../../lib/i18n/i18n.model';

function visibleByDefault(id: string): boolean {
  return id !== 'id' && id !== 'name' && id !== 'api_token';
}

function buildColumnDefinitions(i18n: I18nFormats) {
  const accountDetailBaseHref = useHref('/accounts');
  const { formatDateTime } = useDateFormat();

  const displayNameColumn = {
    id: 'display_name',
    header: i18n.pages.gw2Accounts.tableColumns.displayName,
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
      header: i18n.pages.gw2Accounts.tableColumns.id,
      cell: (v) => <Box fontSize={'body-s'} variant={'samp'}>{v.id}</Box>,
      sortingField: 'id',
    },
    {
      id: 'name',
      header: i18n.pages.gw2Accounts.tableColumns.name,
      cell: (v) => v.name,
      sortingField: 'name',
    },
    displayNameColumn,
    {
      id: 'verification_status',
      header: i18n.pages.gw2Accounts.tableColumns.verificationStatus,
      cell: (v) => <VerificationStatusIndicator status={v.verificationStatus} />,
      sortingField: 'verificationStatus',
    },
    {
      id: 'authorized_apps',
      header: i18n.pages.gw2Accounts.tableColumns.authorizedApplications,
      cell: (v) => v.authorizedApps,
      sortingField: 'authorizedApps',
    },
    {
      id: 'api_token',
      header: i18n.pages.gw2Accounts.tableColumns.apiToken,
      cell: (v) => <Gw2ApiToken value={v.apiToken} />,
      sortingField: 'apiToken',
    },
    {
      id: 'creation_time',
      header: i18n.pages.gw2Accounts.tableColumns.created,
      cell: (v) => formatDateTime(v.creationTime),
      sortingField: 'creationTime',
    },
    {
      id: 'actions',
      header: i18n.general.actions,
      cell: (v) => <RouterInlineLink to={`${accountDetailBaseHref}/${encodeURIComponent(v.id)}`}>{i18n.general.details}</RouterInlineLink>,
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
      .catch(catchNotify(notification, i18n.general.failedToLoad(i18n.pages.gw2Accounts.pageHeader)))
      .finally(() => setLoading(false));
  }, [apiClient, notification]);

  return (
    <ContentLayout header={<Header variant={'h1'}>{i18n.pages.gw2Accounts.pageHeader}</Header>}>
      <CustomTable
        items={items}
        loading={isLoading}
        loadingText={i18n.general.loading}
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
            <Box variant={'h5'}>{i18n.pages.gw2Accounts.noGw2AccountsAddedYet}</Box>
            <RouterInlineLink to={useHref('/accounts/add')} variant={'normal'}>{i18n.pages.gw2Accounts.addApiToken}</RouterInlineLink>
          </SpaceBetween>
        }
      />
    </ContentLayout>
  );
}

function TableHeader({ count }: { count: number }) {
  const i18n = useI18n();

  return (
    <Header
      counter={`(${count})`}
      actions={<RouterInlineLink to={useHref('/accounts/add')} variant={'primary'}>{i18n.pages.gw2Accounts.addApiToken}</RouterInlineLink>}
    >{i18n.pages.gw2Accounts.tableHeader}</Header>
  );
}
