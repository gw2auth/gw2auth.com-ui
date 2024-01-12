import { Modal, TopNavigation, TopNavigationProps } from '@cloudscape-design/components';
import React, { useState } from 'react';
import { expectSuccess } from '../../lib/api/api';
import Login from '../login/login';
import PreferencesModal from '../preferences/preferences';
import { catchNotify, useAppControls } from '../util/context/app-controls';
import { useAuthInfo } from '../util/context/auth-info';
import { useHttpClient } from '../util/context/http-client';
import { useI18n } from '../util/context/i18n';
import classes from './header.module.scss';

export default function Gw2AuthHeader() {
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();
  const [authInfo, setAuthInfo] = useAuthInfo();
  const [showPreferences, setShowPreferences] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const i18n = useI18n();

  function logout() {
    (async () => {
      const resp = await apiClient.logout();
      if (resp.status >= 500) {
        expectSuccess(resp);
        return;
      }

      setAuthInfo(null);
    })()
      .catch(catchNotify(notification));
  }

  const utilities: TopNavigationProps.Utility[] = [
    {
      type: 'button',
      text: 'GitHub',
      href: 'https://github.com/gw2auth',
      external: true,
      externalIconAriaLabel: i18n.externalIconAriaLabel,
    },
    {
      type: 'button',
      text: i18n.header.preferences,
      iconName: 'settings',
      onClick: () => setShowPreferences(true),
    },
  ];

  if (authInfo === undefined) {
    utilities.push({
      type: 'button',
      iconName: 'status-in-progress',
      text: i18n.loading,
    });
  } else if (authInfo === null) {
    utilities.push({
      type: 'button',
      variant: 'primary-button',
      iconName: 'user-profile',
      text: i18n.login,
      onClick: () => setShowLogin(true),
    });
  } else {
    utilities.push({
      type: 'menu-dropdown',
      text: i18n.account,
      description: i18n.header.accountDescription(authInfo),
      iconName: 'user-profile',
      items: [
        { id: 'logout', text: i18n.logout, iconName: 'undo' },
      ],
      onItemClick: (event) => {
        if (event.detail.id === 'logout') {
          logout();
        }
      },
    });
  }

  return (
    <>
      <PreferencesModal visible={showPreferences} onDismiss={() => setShowPreferences(false)} />
      <Modal visible={showLogin} onDismiss={() => setShowLogin(false)} header={'Login'}>
        <Login />
      </Modal>
      <header id="gw2auth-custom-header" className={classes['gw2auth-header']}>
        <TopNavigation
          identity={{
            href: '/',
            title: 'GW2Auth',
            logo: {
              src: '/logo_white.svg',
              alt: 'GW2Auth Logo',
            },
          }}
          utilities={utilities}
        />
      </header>
    </>
  );
}
