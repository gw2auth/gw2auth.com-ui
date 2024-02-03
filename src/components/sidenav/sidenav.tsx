import { SideNavigation, SideNavigationProps } from '@cloudscape-design/components';
import React from 'react';
import { useHref, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../util/context/i18n';

export function SideNav() {
  const i18n = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const devItems: Array<SideNavigationProps.Item> = [];
  if (location.pathname.startsWith('/dev')) {
    devItems.push(
      {
        type: 'section-group',
        title: i18n.components.sidenav.developer,
        items: [
          { type: 'link', text: i18n.components.sidenav.devApplications, href: useHref('/dev/applications') },
        ],
      },
    );
  } else {
    devItems.push(
      { type: 'link', text: i18n.components.sidenav.developer, href: useHref('/dev/applications') },
    );
  }

  return (
    <SideNavigation
      items={[
        {
          type: 'section-group',
          title: i18n.components.sidenav.account,
          items: [
            { type: 'link', text: i18n.components.sidenav.gw2Accounts, href: useHref('/accounts') },
            { type: 'link', text: i18n.components.sidenav.gw2AccountVerification, href: useHref('/verification') },
            { type: 'link', text: i18n.components.sidenav.applications, href: useHref('/applications') },
            { type: 'link', text: i18n.components.sidenav.settings, href: useHref('/settings') },
          ],
        },
        { type: 'divider' },
        ...devItems,
      ]}
      activeHref={location.pathname}
      onFollow={(e) => {
        e.preventDefault();
        navigate(e.detail.href);
      }}
    />
  );
}
