import {
  Box,
  Button,
  Container, DatePicker, ExpandableSection,
  Form, FormField, Header, Multiselect, MultiselectProps, SpaceBetween,
} from '@cloudscape-design/components';
import React, { useMemo, useState } from 'react';
import { useHref, useNavigate, useParams } from 'react-router-dom';
import { Copy } from '../../components/common/copy';
import { KeyValuePairs, ValueWithLabel } from '../../components/common/key-value-pairs';
import { RouterInlineLink } from '../../components/common/router-link';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { expectSuccess } from '../../lib/api/api';

export function DevApplicationsAPIKeysCreate() {
  const { id: applicationId } = useParams();
  if (applicationId === undefined) {
    throw new Error();
  }

  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const navigate = useNavigate();
  const applicationHref = useHref(`/dev/applications/${encodeURIComponent(applicationId)}#api_keys`);

  const [permissions, setPermissions] = useState<ReadonlyArray<MultiselectProps.Option>>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  const permissionsError = useMemo(() => {
    if (permissions.length < 1) {
      return 'At least one required';
    }

    return '';
  }, [permissions]);

  function onSubmitClick() {
    const perms = permissions.map((v) => v.value!);
    const exp = expiresAt.length < 1 ? undefined : expiresAt;

    const updateNotification = notification.add({
      type: 'in-progress',
      content: 'API Key creation in progress...',
      dismissible: false,
    });

    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.createDevApplicationApiKey(applicationId!, perms, exp));
      const basicAuth = btoa(`${body.id}:${body.key}`);
      const basicAuthFull = `Authorization: Basic ${basicAuth}`;

      updateNotification({
        type: 'success',
        content: (
          <SpaceBetween direction={'vertical'} size={'xs'}>
            <Box>You API Key was created. Copy the secret now:</Box>
            <ExpandableSection headerText={'Show'} variant={'footer'}>
              <KeyValuePairs columns={1}>
                <ValueWithLabel label={'ID (Username)'}>
                  <Copy copyText={body.key}><Box variant={'samp'} fontSize={'body-s'}>{body.id}</Box></Copy>
                </ValueWithLabel>
                <ValueWithLabel label={'Secret (Password)'}>
                  <Copy copyText={body.key}><Box variant={'samp'} fontSize={'body-s'}>{body.key}</Box></Copy>
                </ValueWithLabel>
                <ValueWithLabel label={'Header'}>
                  <Copy copyText={basicAuthFull}><Box variant={'samp'} fontSize={'body-s'}>{basicAuthFull}</Box></Copy>
                </ValueWithLabel>
              </KeyValuePairs>
            </ExpandableSection>
          </SpaceBetween>
        ),
        dismissible: true,
      });
      navigate(applicationHref);
    })()
      .catch(catchNotify(updateNotification, 'Failed to create API Key'))
      .finally(() => setLoading(false));
  }

  return (
    <Form
      variant={'full-page'}
      header={<Header variant={'h1'}>Create API Key</Header>}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <RouterInlineLink to={applicationHref} variant={'link'} disabled={loading}>Cancel</RouterInlineLink>
          <Button variant={'primary'} loading={loading} disabled={permissionsError !== ''} onClick={onSubmitClick}>Submit</Button>
        </SpaceBetween>
      }
    >
      <Container>
        <SpaceBetween direction={'vertical'} size={'l'}>
          <FormField label={'Permissions'} description={'Assign permissions to this API Key'} errorText={permissionsError}>
            <Multiselect
              filteringType={'auto'}
              options={[
                {
                  value: 'read',
                  label: 'read',
                  description: 'Not implemented',
                  disabled: true,
                },
                {
                  value: 'client:create',
                  label: 'client:create',
                  description: 'Not implemented',
                  disabled: true,
                },
                {
                  value: 'client:modify',
                  label: 'client:modify',
                },
              ]}
              selectedOptions={permissions}
              onChange={(e) => setPermissions(e.detail.selectedOptions)}
              keepOpen={true}
              disabled={loading}
            />
          </FormField>

          <FormField label={'Expires At'} description={'The time when this API Key should expire - optional'}>
            <DatePicker value={expiresAt} isDateEnabled={(d) => d.getTime() >= (Date.now() + (1000 * 60 * 60))} onChange={(e) => setExpiresAt(e.detail.value)} disabled={loading} />
          </FormField>
        </SpaceBetween>
      </Container>
    </Form>
  );
}
