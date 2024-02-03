import {
  Alert,
  Box,
  Button,
  ColumnLayout,
  Header,
  Modal,
  ModalProps,
  SpaceBetween,
  Tiles,
} from '@cloudscape-design/components';
import React, { useEffect, useMemo, useState } from 'react';
import { ConsentLevel } from '../../lib/consent.model';
import { I18N_GW2AUTH } from '../../lib/i18n/i18n-strings';
import {
  ColorScheme, DateFormat, Locale, Preferences, UIDensity, 
} from '../../lib/preferences.model';
import { useI18n } from '../util/context/i18n';
import { useConsent } from '../util/state/use-consent';
import { ISO8601DateFormatter, localeDateFormatter, SystemDateFormatter } from '../util/state/use-dateformat';
import { resolveEffectiveLocale, usePreferences, useSystemLocale } from '../util/state/use-preferences';

export default function PreferencesModal(props: ModalProps) {
  const i18n = useI18n();
  const [consentLevels] = useConsent();
  const systemLocale = useSystemLocale();
  const [preferences, setPreferences] = usePreferences();
  const [tempPreferences, setTempPreferences] = useState<Preferences>(preferences);
  const date = useMemo(() => new Date(), []);

  useEffect(() => {
    setTempPreferences(preferences);
  }, [preferences]);

  const { onDismiss } = props;
  function onCancelClick(e: CustomEvent) {
    setTempPreferences(preferences);

    if (onDismiss) {
      onDismiss(new CustomEvent(e.type, { detail: { reason: 'cancel' } }));
    }
  }

  function onSaveClick(e: CustomEvent) {
    setPreferences(tempPreferences);

    if (onDismiss) {
      onDismiss(new CustomEvent(e.type, { detail: { reason: 'save' } }));
    }
  }

  return (
    <Modal
      {...props}
      header={i18n.components.preferences.header}
      size={'large'}
      footer={
        <Box float={'right'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'link'} onClick={onCancelClick}>{i18n.general.cancel}</Button>
            <Button variant={'primary'} onClick={onSaveClick}>{i18n.general.save}</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <ColumnLayout columns={1}>
        {
          !consentLevels.has(ConsentLevel.FUNCTIONALITY) && <Alert type={'warning'}>{i18n.components.preferences.functionalCookieWarning}</Alert>
        }
        <div>
          <Header variant={'h3'}>{i18n.components.preferences.locale.category}</Header>
          <Tiles
            value={tempPreferences.locale}
            onChange={(e) => {
              setTempPreferences((prev) => ({ ...prev, locale: e.detail.value as Locale }));
            }}
            items={[
              {
                label: i18n.components.preferences.locale.name(Locale.SYSTEM),
                value: Locale.SYSTEM,
              },
              {
                label: i18n.components.preferences.locale.name(Locale.EN),
                value: Locale.EN,
              },
              {
                label: i18n.components.preferences.locale.name(Locale.DE),
                value: Locale.DE,
              },
            ]}
          />
        </div>
        <div>
          <Header variant={'h3'}>{i18n.components.preferences.dateAndTime.category}</Header>
          <Tiles
            value={tempPreferences.dateFormat}
            onChange={(e) => {
              setTempPreferences((prev) => ({ ...prev, dateFormat: e.detail.value as DateFormat }));
            }}
            items={[
              {
                label: i18n.components.preferences.dateAndTime.name(DateFormat.SYSTEM),
                description: SystemDateFormatter.formatDateTime(date),
                value: DateFormat.SYSTEM,
              },
              {
                label: i18n.components.preferences.dateAndTime.name(DateFormat.LOCALE),
                description: localeDateFormatter(I18N_GW2AUTH[resolveEffectiveLocale(tempPreferences.locale, systemLocale)]).formatDateTime(date),
                value: DateFormat.LOCALE,
              },
              {
                label: i18n.components.preferences.dateAndTime.name(DateFormat.ISO_8601),
                description: ISO8601DateFormatter.formatDateTime(date),
                value: DateFormat.ISO_8601,
              },
            ]}
          />
        </div>
        <div>
          <Header variant={'h3'}>{i18n.components.preferences.theme.category}</Header>
          <Tiles
            value={tempPreferences.colorScheme}
            onChange={(e) => {
              setTempPreferences((prev) => ({ ...prev, colorScheme: e.detail.value as ColorScheme }));
            }}
            items={[
              {
                label: i18n.components.preferences.theme.name(ColorScheme.SYSTEM),
                description: i18n.components.preferences.theme.description(ColorScheme.SYSTEM),
                value: ColorScheme.SYSTEM,
              },
              {
                label: i18n.components.preferences.theme.name(ColorScheme.LIGHT),
                description: i18n.components.preferences.theme.description(ColorScheme.LIGHT),
                value: ColorScheme.LIGHT,
              },
              {
                label: i18n.components.preferences.theme.name(ColorScheme.DARK),
                description: i18n.components.preferences.theme.description(ColorScheme.DARK),
                value: ColorScheme.DARK,
              },
            ]}
          />
        </div>
        <div>
          <Header variant={'h3'}>{i18n.components.preferences.density.category}</Header>
          <Tiles
            value={tempPreferences.uiDensity}
            onChange={(e) => {
              setTempPreferences((prev) => ({ ...prev, uiDensity: e.detail.value as UIDensity }));
            }}
            items={[
              {
                label: i18n.components.preferences.density.name(UIDensity.COMFORTABLE),
                description: i18n.components.preferences.density.description(UIDensity.COMFORTABLE),
                value: UIDensity.COMFORTABLE,
              },
              {
                label: i18n.components.preferences.density.name(UIDensity.COMPACT),
                description: i18n.components.preferences.density.description(UIDensity.COMPACT),
                value: UIDensity.COMPACT,
              },
            ]}
          />
        </div>
      </ColumnLayout>
    </Modal>
  );
}
