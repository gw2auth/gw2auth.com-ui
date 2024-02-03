import {
  Box,
  ContentLayout,
  Header, StatusIndicator,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { useHref } from 'react-router-dom';
import { Copy } from '../../components/common/copy';
import { CustomTable, CustomTableColumnDefinition } from '../../components/common/custom-table';
import { Hidden } from '../../components/common/hidden';
import { RouterInlineLink } from '../../components/common/router-link';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { useI18n } from '../../components/util/context/i18n';
import { useDateFormat } from '../../components/util/state/use-dateformat';
import { expectSuccess } from '../../lib/api/api';
import { ApplicationListItem } from '../../lib/api/api.model';
import { I18nFormats } from '../../lib/i18n/i18n.model';

function buildColumnDefinitions(i18n: I18nFormats) {
  const applicationDetailBaseHref = useHref('/applications');
  const { formatDateTime } = useDateFormat();

  return [
    {
      id: 'id',
      header: i18n.pages.applications.tableColumns.id,
      cell: (v) => <Box fontSize={'body-s'} variant={'samp'}>{v.id}</Box>,
      sortingField: 'id',
    },
    {
      id: 'name',
      header: i18n.pages.applications.tableColumns.name,
      cell: (v) => v.displayName,
      sortingField: 'displayName',
    },
    {
      id: 'user_id',
      header: i18n.pages.applications.tableColumns.userId,
      cell: (v) => <Copy copyText={v.userId}><Hidden>{v.userId}</Hidden></Copy>,
      sortingField: 'userId',
    },
    {
      id: 'last_used',
      header: i18n.pages.applications.tableColumns.lastUsed,
      cell: (v) => {
        if (v.lastUsed === undefined) {
          return <StatusIndicator type={'info'}>{i18n.pages.applications.never}</StatusIndicator>;
        }
        
        return formatDateTime(v.lastUsed);
      },
      sortingField: 'lastUsed',
    },
    {
      id: 'authorized_scopes',
      header: i18n.pages.applications.tableColumns.authorizedScopes,
      cell: (v) => <Box fontSize={'body-s'} variant={'samp'}>{JSON.stringify(v.authorizedScopes)}</Box>,
    },
    {
      id: 'actions',
      header: i18n.general.actions,
      cell: (v) => <RouterInlineLink to={`${applicationDetailBaseHref}/${encodeURIComponent(v.id)}`}>Details</RouterInlineLink>,
      alwaysVisible: true,
      preferencesDisable: true,
    },
  ] satisfies Array<CustomTableColumnDefinition<ApplicationListItem>>;
}

function visibleByDefault(id: string): boolean {
  return id !== 'id' && id !== 'authorized_scopes';
}

export function Applications() {
  const i18n = useI18n();

  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const [isLoading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<ApplicationListItem>>([]);

  const columnDefinitions = buildColumnDefinitions(i18n);
  const visibleColumns = columnDefinitions.map((v) => v.id).filter(visibleByDefault);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const resp = expectSuccess(await apiClient.getApplications());
      setItems(resp.body);
    })()
      .catch(catchNotify(notification, i18n.general.failedToLoad(i18n.pages.applications.pageHeader)))
      .finally(() => setLoading(false));
  }, [apiClient, notification]);

  return (
    <ContentLayout header={<Header variant={'h1'}>{i18n.pages.applications.pageHeader}</Header>}>
      <CustomTable
        items={items}
        loading={isLoading}
        loadingText={i18n.general.loading}
        variant={'container'}
        columnDefinitions={columnDefinitions}
        visibleColumns={visibleColumns}
        stickyColumns={{ first: 0, last: 1 }}
        filter={<Header counter={`(${items.length})`}>{i18n.pages.applications.tableHeader}</Header>}// slot usually used for filter
        empty={<Box variant={'h5'} textAlign={'center'}>{i18n.pages.applications.noApplicationsAuthorized}</Box>}
      />
    </ContentLayout>
  );
}
