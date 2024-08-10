import { Alert, Button, SpaceBetween } from '@cloudscape-design/components';
import React from 'react';
import { ConsentLevel } from '../../lib/consent.model';
import { useI18n } from '../util/context/i18n';
import { useConsent } from '../util/state/use-consent';
import classes from './cookie-banner.module.scss';

export function CookieBanner({ onCustomizeClick }: { onCustomizeClick: () => void }) {
  const i18n = useI18n();
  const [, setConsentLevels] = useConsent();

  function onDenyOptionalClick() {
    setConsentLevels([ConsentLevel.STRICTLY_NECESSARY]);
  }

  function onAcceptAllClick() {
    setConsentLevels([ConsentLevel.STRICTLY_NECESSARY, ConsentLevel.FUNCTIONALITY]);
  }

  return (
    <div className={classes['gw2auth-cookie-banner']}>
      <Alert
        type={'info'}
        header={i18n.components.cookieBanner.header}
        action={<SpaceBetween size={'xs'} direction={'horizontal'}>
          <Button variant={'normal'} onClick={onDenyOptionalClick}>{i18n.components.cookieBanner.denyOptional}</Button>
          <Button variant={'normal'} onClick={onCustomizeClick}>{i18n.components.cookieBanner.customize}</Button>
          <Button variant={'primary'} onClick={onAcceptAllClick}>{i18n.components.cookieBanner.acceptAll}</Button>
        </SpaceBetween>}
      >{i18n.components.cookieBanner.content}</Alert>
    </div>
  );
}
