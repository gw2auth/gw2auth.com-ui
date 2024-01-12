import React, { useMemo } from 'react';
import { ColorScheme } from '../../lib/preferences.model';
import { usePreferences } from '../util/state/use-preferences';

export function Gw2AuthLogo({ inverse }: { inverse?: boolean; }) {
  const [preferences] = usePreferences();
  const logoSrc = useMemo(() => {
    let light = preferences.effectiveColorScheme === ColorScheme.LIGHT;
    if (inverse) {
      light = !light;
    }

    return light ? '/logo_white.svg' : '/logo_black.svg';
  }, [inverse, preferences]);

  return (
    <img src={logoSrc} alt={'GW2Auth Logo'} />
  );
}
