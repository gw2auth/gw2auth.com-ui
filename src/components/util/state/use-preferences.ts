import { useEffect, useMemo, useState } from 'react';
import { ConsentLevel } from '../../../lib/consent.model';
import {
  ColorScheme,
  EffectiveLocale,
  EffectivePreferences,
  Locale,
  Preferences,
  UIDensity,
} from '../../../lib/preferences.model';
import { useMediaQuery } from './common';
import { useBrowserStore } from './use-browser-store';

const STORE_CONSENT_LEVEL = ConsentLevel.FUNCTIONALITY;
const STORE_KEY = 'PREFERENCES';

function getSystemLocale(): EffectiveLocale {
  let systemPreferredLocale = Locale.EN;

  if (navigator.language) {
    if (navigator.language.startsWith('de')) {
      systemPreferredLocale = Locale.DE;
    }
  }

  return systemPreferredLocale;
}

export function usePreferences() {
  const [storeValue, setStoreValue] = useBrowserStore(STORE_CONSENT_LEVEL, STORE_KEY);
  const [systemLocale, setSystemLocale] = useState<EffectiveLocale>(getSystemLocale());
  const prefersLightScheme = useMediaQuery('(prefers-color-scheme: light)');

  useEffect(() => {
    const onLanguageChange = () => setSystemLocale(getSystemLocale());
    window.addEventListener('languagechange', onLanguageChange);
    
    return () => window.removeEventListener('languagechange', onLanguageChange);
  }, []);

  const value = useMemo<EffectivePreferences>(() => {
    let preferences: Partial<Preferences> = {};
    if (storeValue != null) {
      preferences = JSON.parse(storeValue) as Partial<Preferences>;
    }

    const locale = preferences.locale ?? Locale.SYSTEM;
    const colorScheme = preferences.colorScheme ?? ColorScheme.SYSTEM;
    const systemColorScheme = prefersLightScheme ? ColorScheme.LIGHT : ColorScheme.DARK;

    return {
      locale: locale,
      colorScheme: colorScheme,
      uiDensity: preferences.uiDensity ?? UIDensity.COMFORTABLE,
      effectiveLocale: locale === Locale.SYSTEM ? systemLocale : locale,
      effectiveColorScheme: colorScheme === ColorScheme.SYSTEM ? systemColorScheme : colorScheme,
    };
  }, [storeValue, systemLocale, prefersLightScheme]);

  function handleValueChange(newValue: Partial<Preferences>) {
    const pref: Preferences = {
      locale: newValue.locale ?? value.locale,
      colorScheme: newValue.colorScheme ?? value.colorScheme,
      uiDensity: newValue.uiDensity ?? value.uiDensity,
    };

    setStoreValue(JSON.stringify(pref));
  }
  
  return [value, handleValueChange] as const;
}
