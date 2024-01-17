import {
  Box, ContentLayout, Header, SpaceBetween,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { useHref } from 'react-router-dom';
import { CustomTable, CustomTableColumnDefinition } from '../../components/common/custom-table';
import { RouterInlineLink } from '../../components/common/router-link';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { useI18n } from '../../components/util/context/i18n';
import { useDateFormat } from '../../components/util/state/use-dateformat';
import { expectSuccess } from '../../lib/api/api';
import { DevApplicationListItem } from '../../lib/api/api.model';

function buildColumnDefinitions() {
  const { formatDateTime } = useDateFormat();
  const applicationDetailBaseHref = useHref('/dev/applications');

  return [
    {
      id: 'id',
      header: 'ID',
      cell: (v) => <Box fontSize={'body-s'} variant={'samp'}>{v.id}</Box>,
      sortingField: 'id',
    },
    {
      id: 'name',
      header: 'Name',
      cell: (v) => v.displayName,
      sortingField: 'displayName',
    },
    {
      id: 'creation_time',
      header: 'Created',
      cell: (v) => formatDateTime(v.creationTime),
      sortingField: 'creationTime',
    },
    {
      id: 'client_count',
      header: 'Clients',
      cell: (v) => v.clientCount,
      sortingField: 'clientCount',
    },
    {
      id: 'user_count',
      header: 'Users',
      cell: (v) => v.userCount,
      sortingField: 'userCount',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (v) => <RouterInlineLink to={`${applicationDetailBaseHref}/${encodeURIComponent(v.id)}`}>Details</RouterInlineLink>,
      alwaysVisible: true,
      preferencesDisable: true,
    },
  ] satisfies Array<CustomTableColumnDefinition<DevApplicationListItem>>;
}

function visibleByDefault(id: string): boolean {
  return id !== 'id';
}

export function DevApplications() {
  const i18n = useI18n();
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const [isLoading, setLoading] = useState(true);
  const [items, setItems] = useState<Array<DevApplicationListItem>>([]);

  const columnDefinitions = buildColumnDefinitions();
  const visibleColumns = columnDefinitions.map((v) => v.id).filter(visibleByDefault);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const resp = expectSuccess(await apiClient.getDevApplications());
      setItems(resp.body);
    })()
      .catch(catchNotify(notification, 'Failed to load your applications'))
      .finally(() => setLoading(false));
  }, [apiClient]);

  return (
    <ContentLayout header={<Header variant={'h1'}>Applications</Header>}>
      <CustomTable
        items={items}
        loading={isLoading}
        loadingText={i18n.loading}
        variant={'container'}
        columnDefinitions={columnDefinitions}
        visibleColumns={visibleColumns}
        stickyColumns={{ first: 0, last: 1 }}
        filter={<TableHeader count={items.length} />}// slot usually used for filter
        empty={
          <SpaceBetween size={'m'} direction={'vertical'} alignItems={'center'}>
            <Box variant={'h5'}>No applications created yet</Box>
            <RouterInlineLink to={useHref('/dev/applications/create')} variant={'normal'}>Create Application</RouterInlineLink>
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
      actions={<RouterInlineLink to={useHref('/dev/applications/create')} variant={'primary'}>Create Application</RouterInlineLink>}
    >Applications</Header>
  );
}
