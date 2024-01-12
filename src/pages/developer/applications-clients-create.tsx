import {
  Box,
  Button, Checkbox,
  Container,
  Form,
  FormField,
  Header,
  Input,
  SpaceBetween,
} from '@cloudscape-design/components';
import React, { useMemo, useState } from 'react';
import { useHref, useNavigate, useParams } from 'react-router-dom';
import { Copy } from '../../components/common/copy';
import { Hidden } from '../../components/common/hidden';
import { RouterInlineLink } from '../../components/common/router-link';
import { RedirectURIsEditor } from '../../components/dev-application/redirect-uris-editor';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { expectSuccess } from '../../lib/api/api';

export function DevApplicationsClientsCreate() {
  const { id: applicationId } = useParams();
  if (applicationId === undefined) {
    throw new Error();
  }

  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const navigate = useNavigate();
  const applicationHref = useHref(`/dev/applications/${encodeURIComponent(applicationId)}#clients`);

  const [displayName, setDisplayName] = useState('');
  const [redirectURIs, setRedirectURIs] = useState<ReadonlyArray<string>>(['']);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayNameError = useMemo(() => {
    if (displayName.length < 1 || displayName.length > 100) {
      return 'Must be between 1 and 100 characters';
    }

    return '';
  }, [displayName]);

  const redirectURIsError = useMemo(() => {
    if (redirectURIs.length < 1 || redirectURIs.length > 50) {
      return 'At least one required';
    }

    return '';
  }, [redirectURIs]);

  function onSubmitClick() {
    const updateNotification = notification.add({
      type: 'in-progress',
      content: 'Client creation in progress...',
      dismissible: false,
    });

    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.createDevApplicationClient(applicationId!, displayName, redirectURIs, requiresApproval));

      updateNotification({
        type: 'success',
        content: (
          <SpaceBetween direction={'vertical'} size={'xs'}>
            <Box>You client was created. Copy the client secret now:</Box>
            <Copy copyText={body.clientSecret} position={'bottom'}>
              <Hidden>{body.clientSecret}</Hidden>
            </Copy>
          </SpaceBetween>
        ),
        dismissible: true,
      });
      navigate(`${applicationHref}/clients/${body.id}`);
    })()
      .catch(catchNotify(updateNotification, 'Failed to create client'))
      .finally(() => setLoading(false));
  }

  return (
    <Form
      variant={'full-page'}
      header={<Header variant={'h1'}>Create Client</Header>}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <RouterInlineLink to={applicationHref} variant={'link'} disabled={loading}>Cancel</RouterInlineLink>
          <Button variant={'primary'} loading={loading} onClick={onSubmitClick}>Submit</Button>
        </SpaceBetween>
      }
    >
      <Container>
        <SpaceBetween direction={'vertical'} size={'l'}>
          <FormField label={'Display Name'} description={'This name will be shown to users'} errorText={displayNameError}>
            <Input value={displayName} type={'text'} disabled={loading} onChange={(e) => setDisplayName(e.detail.value)} />
          </FormField>

          <FormField label={'Approval Type'} description={'If checked, users must be approved before they can sign in using this client'}>
            <Checkbox checked={requiresApproval} disabled={loading} onChange={(e) => setRequiresApproval(e.detail.checked)}>Requires approval</Checkbox>
          </FormField>

          <FormField label={'Redirect URIs'} description={'At least 1 required'} errorText={redirectURIsError}>
            <RedirectURIsEditor
              applicationId={applicationId}
              disabled={loading}
              items={redirectURIs}
              setItems={setRedirectURIs}
            />
          </FormField>
        </SpaceBetween>
      </Container>
    </Form>
  );
}
