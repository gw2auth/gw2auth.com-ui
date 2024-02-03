import {
  Box, Link, LinkProps, SpaceBetween,
} from '@cloudscape-design/components';
import React from 'react';
import { RouterLink } from '../common/router-link';
import { useI18n } from '../util/context/i18n';
import { useMobile } from '../util/state/common';
import classes from './footer.module.scss';

export interface Gw2AuthFooterProps {
  onCookiePreferencesClick: (e: CustomEvent<LinkProps.FollowDetail>) => void;
}

export default function Gw2AuthFooter(props: Gw2AuthFooterProps) {
  const i18n = useI18n();
  const isMobile = useMobile();

  return (
    <footer id="gw2auth-custom-footer" className={classes['gw2auth-footer']}>
      <SpaceBetween size={'xs'} direction={'vertical'}>
        <SpaceBetween size={isMobile ? 'xs' : 'm'} direction={isMobile ? 'vertical' : 'horizontal'}>
          <RouterLink to={'/legal'}>{i18n.footer.legal}</RouterLink>
          <RouterLink to={'/privacy-policy'}>{i18n.footer.privacyPolicy}</RouterLink>
          <Link href={'https://github.com/gw2auth/oauth2-server/wiki/FAQ'} external={true}>{i18n.footer.faq}</Link>
          <Link href={'https://github.com/gw2auth/oauth2-server/wiki'} external={true}>{i18n.footer.developerWiki}</Link>
          <Link variant={'secondary'} href={'#'} onFollow={props.onCookiePreferencesClick}>{i18n.footer.cookiePreferences}</Link>
          <Box variant={'span'}>{i18n.footer.copyrightGw2Auth}</Box>
        </SpaceBetween>
        {...i18n.footer.copyrightGw2.map((v) => <Box variant={'small'}>{v}</Box>)}
      </SpaceBetween>
    </footer>
  );
}
