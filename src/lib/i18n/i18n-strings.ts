import { I18nProviderProps } from '@cloudscape-design/components/i18n';
import { Locale } from '../preferences.model';
import { I18n } from './i18n.model';
import { I18N_DE } from './i18n_de';
import { I18N_EN } from './i18n_en';

export const I18N_GW2AUTH = ({
  [Locale.EN]: I18N_EN,
  [Locale.DE]: I18N_DE,
} as const) satisfies I18n;

export const customI18nMessages: I18nProviderProps.Messages = {
  '@cloudscape-design/components': {
    en: {},
    de: {},
  },
};
