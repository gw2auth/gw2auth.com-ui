import { SideNavigation, SideNavigationProps } from '@cloudscape-design/components';
import React from 'react';
import { useHref, useLocation, useNavigate } from 'react-router-dom';

export function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const devItems: Array<SideNavigationProps.Item> = [];
  if (location.pathname.startsWith('/dev')) {
    devItems.push(
      {
        type: 'section-group',
        title: 'Developer',
        items: [
          { type: 'link', text: 'Applications', href: useHref('/dev/applications') },
        ],
      },
    );
  } else {
    devItems.push(
      { type: 'link', text: 'Developer', href: useHref('/dev/applications') },
    );
  }

  return (
    <SideNavigation
      items={[
        {
          type: 'section-group',
          title: 'Account',
          items: [
            { type: 'link', text: 'GW2 Accounts', href: useHref('/accounts') },
            { type: 'link', text: 'GW2 Account Verification', href: useHref('/verification') },
            { type: 'link', text: 'Applications', href: useHref('/applications') },
            { type: 'link', text: 'Settings', href: useHref('/settings') },
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
