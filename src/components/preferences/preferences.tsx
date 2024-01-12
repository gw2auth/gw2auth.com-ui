import {
  Alert,
  Box,
  Button,
  ColumnLayout,
  Header,
  Modal,
  ModalProps,
  Select,
  SelectProps,
  SpaceBetween,
  Tiles,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { ConsentLevel } from '../../lib/consent.model';
import {
  ColorScheme, Locale, Preferences, UIDensity, 
} from '../../lib/preferences.model';
import { useI18n } from '../util/context/i18n';
import { useConsent } from '../util/state/use-consent';
import { usePreferences } from '../util/state/use-preferences';

export default function PreferencesModal(props: ModalProps) {
  const i18n = useI18n();
  const [consentLevels] = useConsent();
  const [preferences, setPreferences] = usePreferences();
  const [tempPreferences, setTempPreferences] = useState<Preferences>(preferences);

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
      header={'Customize preferences'}
      size={'large'}
      footer={
        <Box float={'right'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'link'} onClick={onCancelClick}>Cancel</Button>
            <Button variant={'primary'} onClick={onSaveClick}>Save preferences</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <ColumnLayout columns={1}>
        {
          !consentLevels.has(ConsentLevel.FUNCTIONALITY) && <Alert type={'warning'}>
            <Box>You have not given permission for <Box variant={'strong'}>functional cookies</Box>. Your choice <Box variant={'strong'}>will not persist</Box> across page loads.</Box>
          </Alert>
        }
        <div>
          <Header variant={'h3'}>{i18n.header.preferencesLocale}</Header>
          <CustomSelect
            value={tempPreferences.locale}
            onChange={(e) => setTempPreferences((prev) => ({ ...prev, locale: e.detail.selectedOption.value as Locale }))}
            options={[
              {
                label: i18n.header.preferencesLocaleSystem,
                value: Locale.SYSTEM,
              },
              {
                label: i18n.header.preferencesLocaleEN,
                value: Locale.EN,
              },
              {
                label: i18n.header.preferencesLocaleDE,
                value: Locale.DE,
              },
            ]}
          />
        </div>
        <div>
          <Header variant={'h3'}>{i18n.header.preferencesTheme}</Header>
          <Tiles
            value={tempPreferences.colorScheme}
            onChange={(e) => {
              setTempPreferences((prev) => ({ ...prev, colorScheme: e.detail.value as ColorScheme }));
            }}
            items={[
              {
                label: i18n.header.preferencesThemeSystem,
                description: 'Use your system default theme',
                value: ColorScheme.SYSTEM,
              },
              {
                label: i18n.header.preferencesThemeLight,
                description: 'Classic light theme',
                value: ColorScheme.LIGHT,
              },
              {
                label: i18n.header.preferencesThemeDark,
                description: 'Classic dark theme',
                value: ColorScheme.DARK,
              },
            ]}
          />
        </div>
        <div>
          <Header variant={'h3'}>{i18n.header.preferencesDensity}</Header>
          <Tiles
            value={tempPreferences.uiDensity}
            onChange={(e) => {
              setTempPreferences((prev) => ({ ...prev, uiDensity: e.detail.value as UIDensity }));
            }}
            items={[
              {
                label: i18n.header.preferencesDensityComfortable,
                description: 'Standard spacing',
                value: UIDensity.COMFORTABLE,
              },
              {
                label: i18n.header.preferencesDensityCompact,
                description: 'Reducing spacing',
                value: UIDensity.COMPACT,
              },
            ]}
          />
        </div>
      </ColumnLayout>
    </Modal>
  );
}

interface CustomSelectProps extends Omit<SelectProps, 'selectedOption' | 'options'> {
  value: string;
  options: ReadonlyArray<SelectProps.Option>;
}

function CustomSelect(props: CustomSelectProps) {
  const [selectedOption, setSelectedOption] = useState<SelectProps.Option | null>(null);
  useEffect(() => {
    const index = props.options.findIndex((v) => v.value === props.value);
    if (index === -1) {
      setSelectedOption(null);
    } else {
      setSelectedOption(props.options[index]);
    }
  }, [props]);

  return (
    <Select selectedOption={selectedOption} {...props} />
  );
}
