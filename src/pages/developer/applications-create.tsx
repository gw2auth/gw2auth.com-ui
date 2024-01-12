import {
  Button,
  Container,
  Form, FormField, Header, Input, SpaceBetween,
} from '@cloudscape-design/components';
import React, { useMemo, useState } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { RouterInlineLink } from '../../components/common/router-link';
import { catchNotify, useAppControls } from '../../components/util/context/app-controls';
import { useHttpClient } from '../../components/util/context/http-client';
import { expectSuccess } from '../../lib/api/api';

export function DevApplicationsCreate() {
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const navigate = useNavigate();
  const applicationsHref = useHref('/dev/applications');

  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const displayNameError = useMemo(() => {
    if (displayName.length < 1 || displayName.length > 100) {
      return 'Must be between 1 and 100 characters';
    }

    return '';
  }, [displayName]);

  function onSubmitClick() {
    const updateNotification = notification.add({
      type: 'in-progress',
      content: 'Application creation in progress...',
      dismissible: false,
    });

    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.createDevApplication(displayName));

      updateNotification({
        type: 'success',
        content: 'Your application was created successfully',
        dismissible: true,
      });
      navigate(`${applicationsHref}/${encodeURIComponent(body.id)}`);
    })()
      .catch(catchNotify(updateNotification, 'Failed to create application'))
      .finally(() => setLoading(false));
  }

  return (
    <Form
      variant={'full-page'}
      header={<Header variant={'h1'}>Create Application</Header>}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <RouterInlineLink to={applicationsHref} variant={'link'} disabled={loading}>Cancel</RouterInlineLink>
          <Button variant={'primary'} loading={loading} onClick={onSubmitClick}>Submit</Button>
        </SpaceBetween>
      }
    >
      <Container>
        <FormField label={'Display Name'} description={'This name will be shown to users'} errorText={displayNameError}>
          <Input value={displayName} type={'text'} disabled={loading} onChange={(e) => setDisplayName(e.detail.value)} />
        </FormField>
      </Container>
    </Form>
  );
}
