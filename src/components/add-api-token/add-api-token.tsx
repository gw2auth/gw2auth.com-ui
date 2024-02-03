import {
  Alert,
  Box, ColumnLayout, FormField, Input, Link, Wizard,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { expectSuccess } from '../../lib/api/api';
import { AllGw2ApiPermissions, ApiTokenAddVerification } from '../../lib/api/api.model';
import {
  CreateAPIToken1, CreateAPIToken2, CreateAPIToken3, Gw2Login,
} from '../common/assets';
import { Copy } from '../common/copy';
import { catchNotify, useAppControls } from '../util/context/app-controls';
import { useHttpClient } from '../util/context/http-client';
import { useI18n } from '../util/context/i18n';
import { usePreferences } from '../util/state/use-preferences';

export function AddApiTokenWizard({ onDismiss }: { onDismiss: () => void }) {
  const i18n = useI18n();
  const [preferences] = usePreferences();
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();

  const [verification, setVerification] = useState<ApiTokenAddVerification>();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [apiToken, setApiToken] = useState('');
  const [apiTokenError, setApiTokenError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { body } = expectSuccess(await apiClient.getApiTokenAddVerification());
      setVerification(body);
    })()
      .catch(catchNotify(notification, i18n.general.failedToLoad(i18n.components.addApiToken.tokenVerification)))
      .finally(() => setLoading(false));
  }, [apiClient, notification]);

  function addApiToken() {
    setLoading(true);
    (async () => {
      const { body, error } = await apiClient.addApiToken(null, apiToken);
      if (error !== undefined) {
        setApiTokenError(error.message);
        return;
      }

      if (body.verified) {
        notification.add({
          type: 'success',
          content: i18n.components.addApiToken.successVerified,
          dismissible: true,
        });
      } else {
        notification.add({
          type: 'info',
          content: i18n.components.addApiToken.successNotVerified,
          dismissible: true,
        });
      }

      onDismiss();
    })()
      .catch(catchNotify(notification, i18n.components.addApiToken.failed))
      .finally(() => setLoading(false));
  }

  return (
    <Wizard
      submitButtonText={i18n.general.submit}
      allowSkipTo={true}
      activeStepIndex={activeStepIndex}
      onNavigate={(e) => setActiveStepIndex(e.detail.requestedStepIndex)}
      onSubmit={addApiToken}
      onCancel={onDismiss}
      isLoadingNextStep={loading}
      steps={[
        {
          title: i18n.components.addApiToken.wizard.gw2Login.title,
          description: i18n.components.addApiToken.wizard.gw2Login.description,
          content: (
            <ColumnLayout columns={1}>
              {i18n.components.addApiToken.wizard.gw2Login.content(({ children }) => <Link href={'https://account.arena.net/applications'} external={true}>{children}</Link>)}
              <Gw2Login />
            </ColumnLayout>
          ),
          isOptional: true,
        },
        {
          title: i18n.components.addApiToken.wizard.createToken.title,
          description: i18n.components.addApiToken.wizard.createToken.description,
          content: <CreateAPIToken1 variant={preferences.effectiveColorScheme} />,
          isOptional: true,
        },
        {
          title: i18n.components.addApiToken.wizard.assignNameAndPermissions.title,
          description: i18n.components.addApiToken.wizard.assignNameAndPermissions.description,
          content: (
            <ColumnLayout columns={1}>
              <Alert type={'info'}>
                <FormField label={i18n.components.addApiToken.wizard.assignNameAndPermissions.formFieldName} description={verification !== undefined ? i18n.components.addApiToken.wizard.assignNameAndPermissions.formFieldDescription : undefined}>
                  {
                    verification !== undefined
                      ? <Copy copyText={verification.tokenName}><Box variant={'samp'}>{verification.tokenName}</Box></Copy>
                      : <Box>{i18n.components.addApiToken.wizard.assignNameAndPermissions.anyName}</Box>
                  }
                </FormField>
              </Alert>
              <CreateAPIToken2
                name={verification?.tokenName ?? 'GW2Auth'}
                permissions={AllGw2ApiPermissions}
                permissionsText={i18n.components.addApiToken.wizard.assignNameAndPermissions.permissionInfo}
                variant={preferences.effectiveColorScheme}
              />
            </ColumnLayout>
          ),
          isOptional: true,
        },
        {
          title: i18n.components.addApiToken.wizard.copyToken.title,
          description: i18n.components.addApiToken.wizard.copyToken.description,
          content: <CreateAPIToken3 variant={preferences.effectiveColorScheme} />,
          isOptional: true,
        },
        {
          title: i18n.components.addApiToken.wizard.addToken.title,
          description: i18n.components.addApiToken.wizard.addToken.description,
          errorText: apiTokenError,
          content: (
            <FormField label={i18n.components.addApiToken.wizard.addToken.formFieldName} description={i18n.components.addApiToken.wizard.addToken.formFieldDescription}>
              <Input value={apiToken} type={'text'} disabled={loading} disableBrowserAutocorrect={true} spellcheck={false} onChange={(e) => setApiToken(e.detail.value)} />
            </FormField>
          ),
        },
      ]}
    />
  );
}
