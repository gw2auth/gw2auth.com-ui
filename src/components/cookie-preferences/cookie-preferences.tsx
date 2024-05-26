import {
  Box,
  Button,
  Checkbox,
  CheckboxProps,
  ColumnLayout,
  Grid,
  Header,
  Modal,
  ModalProps,
  SpaceBetween,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { ConsentLevel } from '../../lib/consent.model';
import { RouterLink } from '../common/router-link';
import { useI18n } from '../util/context/i18n';
import { useConsent, useHasConsent } from '../util/state/use-consent';

interface CategoryProps {
  name: string;
  description: string;
  checkbox: CheckboxProps;
}

function Category({ name, description, checkbox }: CategoryProps) {
  const i18n = useI18n();

  return (
    <>
      <Header variant={'h3'}>{name}</Header>
      <Grid
        gridDefinition={[
          { colspan: { default: 12, xxs: 10 } },
          { colspan: { default: 12, xxs: 2 } },
        ]}
      >
        <Box variant={'span'}>{description}</Box>
        <Checkbox {...checkbox}>{i18n.components.cookiePreferences.allowed}</Checkbox>
      </Grid>
    </>
  );
}

export default function CookiePreferences({ onDismiss, ...modalProps }: ModalProps) {
  const i18n = useI18n();
  const hasConsent = useHasConsent();
  const [consentLevels, setConsentLevels] = useConsent();
  const [consent, setConsent] = useState({
    functional: consentLevels.has(ConsentLevel.FUNCTIONALITY),
  });

  useEffect(() => {
    if (hasConsent) {
      setConsent({ functional: consentLevels.has(ConsentLevel.FUNCTIONALITY) });
    } else {
      setConsent({ functional: true });
    }
  }, [hasConsent, consentLevels]);

  function onCancelClick(e: CustomEvent<unknown>) {
    setConsent({ functional: consentLevels.has(ConsentLevel.FUNCTIONALITY) });

    if (onDismiss) {
      onDismiss(new CustomEvent(e.type, { detail: { reason: 'cancel' } }));
    }
  }

  function onDenyAllClick(e: CustomEvent<unknown>) {
    denyAll(e.type);
  }

  function denyAll(eventType: string) {
    setConsentLevels([ConsentLevel.STRICTLY_NECESSARY]);

    if (onDismiss) {
      onDismiss(new CustomEvent(eventType, { detail: { reason: 'save' } }));
    }
  }

  function onSaveClick(e: CustomEvent<unknown>) {
    if (consent.functional) {
      setConsentLevels([ConsentLevel.STRICTLY_NECESSARY, ConsentLevel.FUNCTIONALITY]);
    } else {
      setConsentLevels([ConsentLevel.STRICTLY_NECESSARY]);
    }

    if (onDismiss) {
      onDismiss(new CustomEvent(e.type, { detail: { reason: 'save' } }));
    }
  }

  return (
    <Modal
      onDismiss={(e) => {
        if (!hasConsent && e.detail.reason === 'closeButton') {
          denyAll(e.type);
        } else if (onDismiss) {
          onDismiss(e);
        }
      }}
      {...modalProps}
      header={i18n.components.cookiePreferences.header}
      size={'large'}
      footer={
        <Box float={'right'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            {
              hasConsent
                ? <Button variant={'link'} onClick={onCancelClick}>{i18n.general.cancel}</Button>
                : <Button variant={'link'} onClick={onDenyAllClick}>{i18n.components.cookiePreferences.denyOptional}</Button>
            }
            <Button variant={'primary'} onClick={onSaveClick}>{i18n.general.save}</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <ColumnLayout columns={1} borders={'horizontal'}>
        <Box variant={'span'}>{i18n.components.cookiePreferences.subTitle}</Box>
        <Category
          name={i18n.components.cookiePreferences.essential.name}
          description={i18n.components.cookiePreferences.essential.description}
          checkbox={ { checked: true, disabled: true } }
        ></Category>
        <Category
          name={i18n.components.cookiePreferences.functional.name}
          description={i18n.components.cookiePreferences.functional.description}
          checkbox={
            {
              checked: consent.functional,
              disabled: false,
              onChange: (event) => setConsent((prev) => ({ ...prev, functional: event.detail.checked })),
            }
          }
        ></Category>
        {i18n.components.cookiePreferences.learnMore(({ children }) => <RouterLink to={'/privacy-policy'} fontSize={'inherit'}>{children}</RouterLink>)}
      </ColumnLayout>
    </Modal>
  );
}
