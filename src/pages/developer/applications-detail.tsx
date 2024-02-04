import { CodeView } from '@cloudscape-design/code-view';
import {
  PropertyFilterOperator,
  PropertyFilterOperatorExtended,
} from '@cloudscape-design/collection-hooks';
import {
  Alert,
  Box, Button, ButtonProps,
  Calendar, Checkbox, ColumnLayout, Container,
  ContentLayout,
  DateInput,
  FormField,
  Header, HelpPanel, Link,
  Pagination,
  PropertyFilter,
  PropertyFilterProps, SpaceBetween, Spinner, StatusIndicator, StatusIndicatorProps, Tabs, TextContent,
} from '@cloudscape-design/components';
import { LinkProps } from '@cloudscape-design/components/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
  useHref, useLocation, useNavigate, useParams,
} from 'react-router-dom';
import { Copy } from '../../components/common/copy';
import { CustomTable, CustomTableColumnDefinition } from '../../components/common/custom-table';
import { DeleteModal, DeleteModalProps } from '../../components/common/delete-modal';
import { KeyValuePairs, ValueWithLabel } from '../../components/common/key-value-pairs';
import { RouterInlineLink } from '../../components/common/router-link';
import { ApprovalType } from '../../components/dev-application/approval-type';
import { catchNotify, useAppControls, useTools } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { useI18n } from '../../components/util/context/i18n';
import { useDateFormat } from '../../components/util/state/use-dateformat';
import { usePreferences } from '../../components/util/state/use-preferences';
import { expectSuccess } from '../../lib/api/api';
import {
  ApprovalStatus, DevApplication, DevApplicationClientListItem, DevApplicationUser, PagedResponse,
} from '../../lib/api/api.model';
import { OAUTH2_SCOPES } from '../../lib/oauth2.model';
import { EffectiveLocale } from '../../lib/preferences.model';

export function DevApplicationsDetail() {
  const { id } = useParams();
  if (id === undefined) {
    throw new Error();
  }

  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const { hash } = useLocation();
  const navigate = useNavigate();

  let initialTabId = hash.substring(1);
  if (!['clients', 'api_keys', 'users'].includes(initialTabId)) {
    initialTabId = 'clients';
  }

  const [isLoading, setLoading] = useState(false);
  const [devApplication, setDevApplication] = useState<DevApplication>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTabId, setActiveTabId] = useState(initialTabId);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const resp = expectSuccess(await apiClient.getDevApplication(id));
      setDevApplication(resp.body);
    })()
      .catch(catchNotify(notification, 'Failed to load your Application'))
      .finally(() => setLoading(false));
  }, [id, apiClient]);

  let overview: React.ReactNode;
  let clients: React.ReactNode;
  let apiKeys: React.ReactNode;
  if (isLoading) {
    overview = <Spinner size={'large'} />;
    clients = <Spinner size={'large'} />;
    apiKeys = <Spinner size={'large'} />;
  } else if (devApplication === undefined) {
    overview = <Box>Failed to load</Box>;
    clients = <Box>Failed to load</Box>;
    apiKeys = <Box>Failed to load</Box>;
  } else {
    overview = <Overview id={id} devApplication={devApplication} />;
    clients = <ClientTable id={id} devApplication={devApplication} />;
    apiKeys = <APIKeyTable id={id} devApplication={devApplication} onUpdate={setDevApplication} />;
  }

  return (
    <>
      <ApplicationDeleteModal
        item={showDeleteModal ? id : undefined}
        loading={deleteLoading}
        onDismiss={(e) => {
          if (e.detail.reason !== 'delete') {
            setShowDeleteModal(false);
            return;
          }

          const updateNotification = notification.add({
            type: 'in-progress',
            content: 'Deleting your application...',
            dismissible: false,
          });

          setDeleteLoading(true);
          (async () => {
            expectSuccess(await apiClient.deleteDevApplication(e.detail.item));

            updateNotification({
              type: 'success',
              content: 'Your application was deleted',
              dismissible: true,
            });
            navigate('/dev/applications');
          })()
            .catch(catchNotify(updateNotification, 'Failed to delete application'))
            .finally(() => {
              setDeleteLoading(false);
              setShowDeleteModal(false);
            });
        }}
      />
      <ContentLayout
        header={
          <Header
            variant={'h1'}
            actions={<Button loading={deleteLoading} onClick={() => setShowDeleteModal(true)}>Delete</Button>}
          >{devApplication?.displayName ?? id}</Header>
        }
      >
        <ColumnLayout columns={1}>
          <Container variant={'stacked'}>{overview}</Container>
          <Tabs
            activeTabId={activeTabId}
            onChange={(e) => {
              setActiveTabId(e.detail.activeTabId);
              navigate(e.detail.activeTabHref!, { replace: true, relative: 'route' });
            }}
            variant={'stacked'}
            tabs={[
              {
                id: 'clients',
                href: '#clients',
                label: 'Clients',
                content: clients,
              },
              {
                id: 'api_keys',
                href: '#api_keys',
                label: 'API Keys',
                content: apiKeys,
              },
              {
                id: 'users',
                href: '#users',
                label: 'Users',
                content: <UserTable id={id} clients={devApplication?.clients ?? []} />,
              },
            ]}
          />
        </ColumnLayout>
      </ContentLayout>
    </>
  );
}

function Overview({ id, devApplication }: { id: string, devApplication: DevApplication }) {
  const { formatDateTime } = useDateFormat();

  return (
    <KeyValuePairs columns={3}>
      <ValueWithLabel label={'ID'}>
        <Copy copyText={id}><Box variant={'samp'}>{id}</Box></Copy>
      </ValueWithLabel>
      <ValueWithLabel label={'Name'}>
        <Box>{devApplication.displayName}</Box>
      </ValueWithLabel>
      <ValueWithLabel label={'Created'}>
        <Box>{formatDateTime(devApplication.creationTime)}</Box>
      </ValueWithLabel>
    </KeyValuePairs>
  );
}

function ClientTable({ id, devApplication }: { id: string, devApplication: DevApplication }) {
  const { formatDateTime } = useDateFormat();
  const baseHref = useHref(`/dev/applications/${encodeURIComponent(id)}`);

  return (
    <CustomTable
      variant={'embedded'}
      columnDefinitions={[
        {
          id: 'id',
          header: 'ID',
          cell: (v) => <Box variant={'samp'}>{v.id}</Box>,
          sortingField: 'id',
        },
        {
          id: 'creation_time',
          header: 'Created',
          cell: (v) => formatDateTime(v.creationTime),
          sortingField: 'creationTime',
        },
        {
          id: 'display_name',
          header: 'Name',
          cell: (v) => v.displayName,
          sortingField: 'displayName',
        },
        {
          id: 'api_version',
          header: 'API Version',
          cell: (v) => <Box variant={'samp'}>{v.apiVersion}</Box>,
          sortingField: 'apiVersion',
        },
        {
          id: 'type',
          header: 'Type',
          cell: (v) => v.type,
          sortingField: 'type',
        },
        {
          id: 'requires_approval',
          header: 'Approval Type',
          cell: (v) => <ApprovalType requiresApproval={v.requiresApproval} />,
          sortingField: 'requiresApproval',
        },
        {
          id: 'actions',
          header: 'Actions',
          cell: (v) => <RouterInlineLink to={`${baseHref}/clients/${encodeURIComponent(v.id)}`}>Details</RouterInlineLink>,
          alwaysVisible: true,
          preferencesDisable: true,
        },
      ]}
      stickyColumns={{ first: 0, last: 1 }}
      items={devApplication.clients}
      filter={
        <Header
          counter={`(${devApplication.clients.length})`}
          actions={<RouterInlineLink to={`${baseHref}/clients/create`} variant={'primary'}>Create Client</RouterInlineLink>}
        >Clients</Header>
      }
      empty={
        <SpaceBetween size={'m'} direction={'vertical'} alignItems={'center'}>
          <Box variant={'h5'}>No clients created yet</Box>
          <RouterInlineLink to={`${baseHref}/clients/create`} variant={'normal'}>Create Client</RouterInlineLink>
        </SpaceBetween>
      }
    />
  );
}

function APIKeyTable({ id, devApplication, onUpdate }: { id: string, devApplication: DevApplication, onUpdate: React.Dispatch<React.SetStateAction<DevApplication | undefined>> }) {
  const { formatDateTime } = useDateFormat();
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();
  const baseHref = useHref(`/dev/applications/${encodeURIComponent(id)}`);

  const [deleteModalItem, setDeleteModalItem] = useState<string>();
  const [isDeleteLoading, setDeleteLoading] = useState(false);

  return (
    <>
      <APIKeyDeleteModal
        item={deleteModalItem}
        loading={isDeleteLoading}
        onDismiss={(e) => {
          if (e.detail.reason !== 'delete') {
            setDeleteModalItem(undefined);
            return;
          }

          const keyId = e.detail.item;
          const updateNotification = notification.add({
            type: 'in-progress',
            content: 'Deleting your API Key...',
            dismissible: false,
          });

          setDeleteLoading(true);
          (async () => {
            expectSuccess(await apiClient.deleteDevApplicationApiKey(id, keyId));

            onUpdate((prev) => {
              if (prev === undefined) {
                return undefined;
              }

              return {
                ...prev,
                apiKeys: prev.apiKeys.filter((v) => v.id !== keyId),
              };
            });

            updateNotification({
              type: 'success',
              content: 'Your API Key was deleted',
              dismissible: true,
            });
          })()
            .catch(catchNotify(updateNotification, 'Failed to delete API Key'))
            .finally(() => {
              setDeleteLoading(false);
              setDeleteModalItem(undefined);
            });
        }}
      />
      <CustomTable
        variant={'borderless'}
        columnDefinitions={[
          {
            id: 'id',
            header: 'ID',
            cell: (v) => <Copy copyText={v.id}><Box variant={'samp'}>{v.id}</Box></Copy>,
            sortingField: 'id',
          },
          {
            id: 'permissions',
            header: 'Permissions',
            cell: (v) => <Box variant={'samp'}>{JSON.stringify(v.permissions)}</Box>,
            sortingField: 'permissions',
          },
          {
            id: 'not_before',
            header: 'Not Before',
            cell: (v) => formatDateTime(v.notBefore),
            sortingField: 'notBefore',
          },
          {
            id: 'expires_at',
            header: 'Expires At',
            cell: (v) => formatDateTime(v.expiresAt),
            sortingField: 'expiresAt',
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (v) => <Button variant={'inline-link'} iconName={'remove'} disabled={isDeleteLoading && deleteModalItem !== v.id} loading={isDeleteLoading && deleteModalItem === v.id} onClick={() => setDeleteModalItem(v.id)}>Delete</Button>,
            alwaysVisible: true,
            preferencesDisable: true,
          },
        ]}
        stickyColumns={{ first: 0, last: 1 }}
        items={devApplication.apiKeys}
        visibleColumns={['id', 'expires_at']}
        filter={
          <Header
            counter={`(${devApplication.apiKeys.length})`}
            actions={<RouterInlineLink to={`${baseHref}/apikeys/create`} variant={'primary'}>Create API Key</RouterInlineLink>}
            info={<APIKeyInfo />}
          >API Keys</Header>
        }
        empty={
          <SpaceBetween size={'m'} direction={'vertical'} alignItems={'center'}>
            <Box variant={'h5'}>No API Keys created yet</Box>
            <RouterInlineLink to={`${baseHref}/apikeys/create`} variant={'normal'}>Create API Key</RouterInlineLink>
          </SpaceBetween>
        }
      />
    </>
  );
}

interface QueryState {
  applicationId: string;
  currentPageIndex: number;
  query: PropertyFilterProps.Query;
  pages: ReadonlyArray<PagedResponse<DevApplicationUser>>;
}

function buildColumnDefinitions(formatDateTime: (v: string) => string, onActionClick: (clientId: string, userId: string, status: ApprovalStatus) => void) {
  return [
    {
      id: 'user_id',
      header: 'User ID',
      cell: (v) => <Box variant={'samp'}>{v.userId}</Box>,
    },
    {
      id: 'creation_time',
      header: 'Created',
      cell: (v) => formatDateTime(v.creationTime),
    },
    {
      id: 'client_id',
      header: 'Client ID',
      cell: (v) => {
        if (v.client === undefined) {
          return undefined;
        }

        return <Box variant={'samp'}>{v.client.clientId}</Box>;
      },
    },
    {
      id: 'approval_status',
      header: 'Approval Status',
      cell: (v) => {
        if (v.client === undefined) {
          return undefined;
        }

        const [type, text] = ({
          APPROVED: ['success', 'Approved'],
          PENDING: ['pending', 'Pending'],
          BLOCKED: ['error', 'Blocked'],
        } satisfies Record<ApprovalStatus, [StatusIndicatorProps.Type, string]>)[v.client.approvalStatus];

        return <StatusIndicator type={type}>{text}</StatusIndicator>;
      },
    },
    {
      id: 'approval_request_message',
      header: 'Approval Message',
      cell: (v) => {
        if (v.client === undefined) {
          return undefined;
        }

        return <Box variant={'samp'}>{v.client.approvalRequestMessage}</Box>;
      },
    },
    {
      id: 'authorized_scopes',
      header: 'Scopes',
      cell: (v) => {
        if (v.client === undefined) {
          return undefined;
        }

        return <Box variant={'samp'}>{JSON.stringify(v.client.authorizedScopes)}</Box>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (v) => {
        if (v.client === undefined) {
          return <StatusIndicator type={'info'}>N/A</StatusIndicator>;
        }

        const { client } = v;
        const [newStatus, text] = ({
          APPROVED: ['BLOCKED', 'Block'],
          PENDING: ['APPROVED', 'Approve'],
          BLOCKED: ['APPROVED', 'Approve'],
        } satisfies Record<ApprovalStatus, [ApprovalStatus, string]>)[v.client.approvalStatus];

        return <Button variant={'inline-link'} onClick={() => onActionClick(client.clientId, v.userId, newStatus)}>{text}</Button>;
      },
      alwaysVisible: true,
      preferencesDisable: true,
    },
  ] satisfies Array<CustomTableColumnDefinition<DevApplicationUser>>;
}

function visibleByDefault(id: string): boolean {
  return id !== 'id';
}

function UserTable({ id, clients }: { id: string; clients: ReadonlyArray<DevApplicationClientListItem> }) {
  const i18n = useI18n();
  const { formatDateTime } = useDateFormat();
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const [isLoading, setLoading] = useState(true);
  const [items, setItems] = useState<ReadonlyArray<DevApplicationUser>>([]);
  const [queryState, setQueryState] = useState<QueryState>({
    applicationId: id,
    currentPageIndex: 1,
    query: {
      tokens: [],
      operation: 'and',
    },
    pages: [],
  });

  const [columnDefinitions, visibleColumns] = useMemo(() => {
    const colDefs = buildColumnDefinitions(formatDateTime, (clientId, userId, status) => {
      setLoading(true);
      (async () => {
        const { body } = expectSuccess(await apiClient.updateDevApplicationUserApproval(id, clientId, userId, status));
        setQueryState((prev) => ({
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            items: page.items.map((user) => {
              if (user.client !== undefined && user.client.clientId === clientId && user.userId === userId) {
                return { ...user, client: { ...user.client, approvalStatus: body.approvalStatus, approvalRequestMessage: body.approvalMessage } };
              }

              return user;
            }),
          })),
        }));
      })()
        .catch(catchNotify(notification, 'Failed to update Approval Status'))
        .finally(() => setLoading(false));
    });

    return [
      colDefs,
      colDefs.map((v) => v.id).filter(visibleByDefault),
    ];
  }, [formatDateTime, id, apiClient]);

  const [totalItemCount, isOpenEnd] = useMemo(() => {
    const totalItems = queryState.pages.map((v) => v.items.length).reduce((p, v) => p + v, 0);
    const openEnd = queryState.pages.length < 1 || queryState.pages[queryState.pages.length - 1].nextToken !== undefined;
    return [totalItems, openEnd];
  }, [queryState]);

  useEffect(() => {
    if (queryState.currentPageIndex <= queryState.pages.length) {
      setItems(queryState.pages[queryState.currentPageIndex - 1].items);
      return;
    }

    setLoading(true);
    (async () => {
      const pageIndexToLoad = queryState.pages.length;
      let nextToken: string | undefined;

      if (pageIndexToLoad > 0) {
        nextToken = queryState.pages[pageIndexToLoad - 1].nextToken;
      }

      const { body } = expectSuccess<PagedResponse<DevApplicationUser>>(await apiClient.getDevApplicationUsers(id, queryState.query, nextToken));
      setQueryState((prev) => {
        const pages = prev.pages.slice(0, pageIndexToLoad);
        pages.push(body);

        return {
          ...prev,
          pages: pages,
        };
      });
    })()
      .catch(catchNotify(notification, 'Failed to load page'))
      .finally(() => setLoading(false));
  }, [apiClient, queryState]);

  return (
    <CustomTable
      items={items}
      loading={isLoading}
      loadingText={i18n.general.loading}
      variant={'borderless'}
      columnDefinitions={columnDefinitions}
      visibleColumns={visibleColumns}
      stickyColumns={{ first: 0, last: 1 }}
      header={<Header counter={`(${totalItemCount}${isOpenEnd ? '+' : ''})`}>Users</Header>}
      filter={
        <Filter
          query={queryState.query}
          setQuery={(query) => {
            setQueryState((prev) => ({
              applicationId: prev.applicationId,
              currentPageIndex: 1,
              query: query,
              pages: [],
            }));
          }}
          clientIds={clients.map((v) => [v.id, v.displayName])}
          disabled={isLoading}
        />
      }
      pagination={
        <Pagination
          currentPageIndex={queryState.currentPageIndex}
          pagesCount={queryState.pages.length}
          openEnd={isOpenEnd}
          disabled={isLoading}
          onChange={(e) => setQueryState((prev) => ({
            ...prev,
            currentPageIndex: e.detail.currentPageIndex,
          }))}
        />
      }
      empty={<Box variant={'h5'}>No users</Box>}
    />
  );
}

interface FilterProps {
  query: PropertyFilterProps.Query;
  setQuery: (query: PropertyFilterProps.Query) => void;
  clientIds: ReadonlyArray<[string, string]>;
  disabled: boolean;
}

function Filter({
  query, setQuery, clientIds, disabled,
}: FilterProps) {
  const [preferences] = usePreferences();

  return (
    <PropertyFilter
      disabled={disabled}
      onChange={(e) => setQuery(e.detail)}
      query={query}
      filteringOptions={[
        ...(clientIds.map((v) => ({ propertyKey: 'client_id', value: v[0], label: v[1] }))),
        { propertyKey: 'approval_status', value: 'APPROVED' },
        { propertyKey: 'approval_status', value: 'PENDING' },
        { propertyKey: 'approval_status', value: 'BLOCKED' },
      ]}
      filteringProperties={[
        {
          key: 'user_id',
          operators: ['='],
          propertyLabel: 'User ID',
          groupValuesLabel: 'User ID values',
        },
        {
          key: 'creation_time',
          operators: ['=', '>=', '>', '<=', '<'].map((op) => buildDateOperator(op, preferences.effectiveLocale)),
          propertyLabel: 'Created',
          groupValuesLabel: 'Created values',
        },
        {
          key: 'client_id',
          operators: ['=', '!='],
          propertyLabel: 'Client ID',
          groupValuesLabel: 'Client ID values',
        },
        {
          key: 'approval_status',
          operators: ['=', '!='],
          propertyLabel: 'Approval Status',
          groupValuesLabel: 'Approval Status values',
        },
        {
          key: 'authorized_scopes',
          operators: ['=', '!=', ':', '!:'].map((op) => buildSelectionOperator(op, OAUTH2_SCOPES)),
          propertyLabel: 'Scopes',
          groupValuesLabel: 'Scopes values',
        },
      ]}
    />
  );
}

function buildDateOperator(op: PropertyFilterOperator, locale: EffectiveLocale): PropertyFilterOperatorExtended<string> {
  return {
    operator: op,
    form: ({ value, onChange }) => (
      <div className={'date-form'}>
        <FormField>
          <DateInput
            value={value ?? ''}
            onChange={(event) => onChange(event.detail.value)}
            placeholder="YYYY-MM-DD"
          />
        </FormField>
        <Calendar
          value={value ?? ''}
          onChange={(event) => onChange(event.detail.value)}
          locale={locale}
        />
      </div>
    ),
    format: (v) => v,
  } satisfies PropertyFilterOperatorExtended<string>;
}

function buildSelectionOperator(op: PropertyFilterOperator, options: ReadonlyArray<string>): PropertyFilterOperatorExtended<string> {
  return {
    operator: op,
    form: ({ value, onChange }) => {
      const values = value?.split(',') ?? [];

      return (
        <FormField>
          {
            options.map((option, i) => (
              <Checkbox
                key={i}
                checked={values.includes(option)}
                onChange={(e) => {
                  const newValue = [...values];
                  if (e.detail.checked) {
                    newValue.push(option);
                  } else {
                    newValue.splice(newValue.indexOf(option), 1);
                  }
                  onChange(newValue.join(','));
                }}
              >{option}</Checkbox>
            ))
          }
        </FormField>
      );
    },
    format: (v) => v,
  } satisfies PropertyFilterOperatorExtended<string>;
}

function ApplicationDeleteModal(props: Omit<DeleteModalProps<string>, 'entityType'>) {
  return (
    <DeleteModal
      {...props}
      entityType={'Application'}
    >
      <SpaceBetween size={'xs'} direction={'vertical'}>
        <Alert type={'warning'}>
          <SpaceBetween size={'xs'} direction={'vertical'}>
            <Box>Deleting an application also deletes all its clients and users.</Box>
            <Box>All clients of this application will immediately stop working upon deletion.</Box>
            <Box><Box variant={'strong'}>This action is not reversible!</Box> Use it with caution.</Box>
          </SpaceBetween>
        </Alert>
      </SpaceBetween>
    </DeleteModal>
  );
}

function APIKeyDeleteModal(props: Omit<DeleteModalProps<string>, 'entityType'>) {
  return (
    <DeleteModal
      {...props}
      entityType={'API Key'}
    >
      <SpaceBetween size={'xs'} direction={'vertical'}>
        <Alert type={'warning'}>
          <SpaceBetween size={'xs'} direction={'vertical'}>
            <Box>The API Key will immediately stop working.</Box>
            <Box><Box variant={'strong'}>This action is not reversible!</Box> Use it with caution.</Box>
          </SpaceBetween>
        </Alert>
      </SpaceBetween>
    </DeleteModal>
  );
}

function APIKeyInfo() {
  const [tools, setTools] = useState<React.ReactNode>();
  const setToolsOpen = useTools(tools);

  useEffect(() => {
    setTools(<APIKeyHelpPanel onCloseClick={() => setToolsOpen(false)} />);
    return () => setTools(undefined);
  }, []);

  function onFollow(e: CustomEvent<LinkProps.FollowDetail>) {
    e.preventDefault();
    setToolsOpen(true);
  }

  return (
    <Link variant={'info'} onFollow={onFollow}>Info</Link>
  );
}

function APIKeyHelpPanel({ onCloseClick }: { onCloseClick: (e: CustomEvent<ButtonProps.ClickDetail>) => void }) {
  const baseURL = `${window.location.protocol}//${window.location.host}`;
  const redirectURIEndpoint = `${baseURL}/api-app/application/client/:client_id/redirecturi`;
  const redirectURIEndpointExample = `PATCH ${redirectURIEndpoint}
Authorization: Basic :auth
Content-Type: application/json

{
  "add": ["https://example.gw2auth.com/callback"],
  "remove": ["https://example.gw2auth.com/callback2"]
}`;

  return (
    <HelpPanel header={<Box variant={'h2'}>API Keys</Box>} footer={<Button onClick={onCloseClick}>Close</Button>}>
      <SpaceBetween size={'m'} direction={'vertical'}>
        <SpaceBetween size={'xs'} direction={'vertical'}>
          <Box>Using an API Key you can modify the redirect URIs of an existing client of this application.</Box>
          <Box variant={'small'}>More endpoints might be added later, allowing for more programmatic automation of your application.</Box>
        </SpaceBetween>
        <SpaceBetween size={'xs'} direction={'vertical'}>
          <Box variant={'h3'}>How can I use an API Key?</Box>
          <Box>GW2Auth provides a set of endpoints to manage your application which can be used with an API Key.</Box>
          <Box>To authorize a request with an API Key, provide the Key ID as username and the Key Secret as password using <Link external={true} href={'https://datatracker.ietf.org/doc/html/rfc7617'}>Basic Authorization</Link>.</Box>
        </SpaceBetween>
        <SpaceBetween size={'xs'} direction={'vertical'}>
          <Box variant={'h3'}>Available Endpoints</Box>
          <Box variant={'h5'}>Modify Redirect URIs of an existing Client</Box>
          <CodeView content={redirectURIEndpointExample} />
          <TextContent><small>This endpoint requires the <samp>client:modify</samp> permission.</small></TextContent>
        </SpaceBetween>
      </SpaceBetween>
    </HelpPanel>
  );
}
