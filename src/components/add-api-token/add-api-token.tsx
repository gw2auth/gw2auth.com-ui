import {
  Box, ColumnLayout, FormField, Input, Link, Wizard,
} from '@cloudscape-design/components';
import React, { useState } from 'react';
import { AllGw2ApiPermissions } from '../../lib/api/api.model';
import {
  CreateAPIToken1, CreateAPIToken2, CreateAPIToken3, Gw2Login, 
} from '../common/assets';
import { catchNotify, useAppControls } from '../util/context/app-controls';
import { useHttpClient } from '../util/context/http-client';
import { usePreferences } from '../util/state/use-preferences';

export function AddApiTokenWizard({ onDismiss }: { onDismiss: () => void }) {
  const [preferences] = usePreferences();
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [apiToken, setApiToken] = useState('');
  const [apiTokenError, setApiTokenError] = useState('');
  const [loading, setLoading] = useState(false);

  function addApiToken() {
    setLoading(true);
    (async () => {
      const resp = await apiClient.addApiToken(null, apiToken);
      if (resp.error !== undefined) {
        setApiTokenError(resp.error.message);
        return;
      }

      notification.add({
        type: 'success',
        content: 'Your API Token was added successfully',
        dismissible: true,
      });
      onDismiss();
    })()
      .catch(catchNotify(notification))
      .finally(() => setLoading(false));
  }

  return (
    <Wizard
      submitButtonText={'Submit'}
      allowSkipTo={true}
      activeStepIndex={activeStepIndex}
      onNavigate={(e) => setActiveStepIndex(e.detail.requestedStepIndex)}
      onSubmit={addApiToken}
      onCancel={onDismiss}
      isLoadingNextStep={loading}
      steps={[
        {
          title: 'Login on the GW2 Website',
          description: 'Login on the official website of Guild Wars 2 using the Guild Wars 2 Account you wish to add',
          content: (
            <ColumnLayout columns={1}>
              <Box>Visit the <Link href={'https://account.arena.net/applications'} external={true}>Guild Wars 2 Account Page</Link> and login using the Guild Wars 2 Account you wish to add.</Box>
              <Gw2Login lang={preferences.effectiveLocale} />
            </ColumnLayout>
          ),
          isOptional: true,
        },
        {
          title: 'Create a new API Token',
          description: 'Click the button to create a new API Token',
          content: <CreateAPIToken1 variant={preferences.effectiveColorScheme} lang={preferences.effectiveLocale} />,
          isOptional: true,
        },
        {
          title: 'Assign name and permissions',
          description: 'Assign a name and permissions. It is recommended to use an API Token with all permissions with GW2Auth',
          content: <CreateAPIToken2
            name={'GW2Auth'}
            permissions={AllGw2ApiPermissions}
            permissionsText={<div>
              <p>Assign permissions</p>
              <p>It is recommended to provide GW2Auth with all permissions</p>
            </div>}
            variant={preferences.effectiveColorScheme}
            lang={preferences.effectiveLocale}
          />,
          isOptional: true,
        },
        {
          title: 'Copy the API Token',
          description: 'Click the button shown below to copy your newly created API Token',
          content: <CreateAPIToken3 variant={preferences.effectiveColorScheme} lang={preferences.effectiveLocale} />,
          isOptional: true,
        },
        {
          title: 'Add the API Token',
          description: 'Add the newly generated API Token to your GW2Auth Account',
          errorText: apiTokenError,
          content: (
            <FormField label={'API Token'} description={'Paste the API Token here'}>
              <Input value={apiToken} type={'text'} disabled={loading} onChange={(e) => setApiToken(e.detail.value)} />
            </FormField>
          ),
        },
      ]}
    />
  );
}
