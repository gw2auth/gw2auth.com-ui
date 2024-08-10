import {
  AppLayout,
  AppLayoutProps,
  Flashbar,
  FlashbarProps,
  LinkProps,
  NonCancelableCustomEvent,
  SplitPanel,
} from '@cloudscape-design/components';
import { I18nProvider as CSI18nProvider } from '@cloudscape-design/components/i18n';
import deMessages from '@cloudscape-design/components/i18n/messages/all.de';
import enMessages from '@cloudscape-design/components/i18n/messages/all.en';
import {
  applyDensity, applyMode, Density, Mode,
} from '@cloudscape-design/global-styles';
import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import { expectSuccess } from '../lib/api/api';
import { AuthInfo } from '../lib/api/api.model';
import { customI18nMessages, I18N_GW2AUTH } from '../lib/i18n/i18n-strings';
import { ColorScheme, UIDensity } from '../lib/preferences.model';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import { CookieBanner } from './cookie-banner/cookie-banner';
import CookiePreferences from './cookie-preferences/cookie-preferences';
import Gw2AuthFooter from './footer/footer';
import Gw2AuthHeader from './header/header';
import { SideNav } from './sidenav/sidenav';
import { AppControlsProvider, catchNotify, useAppControls } from './util/context/app-controls';
import { AuthInfoProvider, useAuthInfo } from './util/context/auth-info';
import { BrowserStoreProvider } from './util/context/browser-store';
import { HttpClientProvider, useHttpClient } from './util/context/http-client';
import { I18nProvider } from './util/context/i18n';
import { useMobile } from './util/state/common';
import { useHasConsent } from './util/state/use-consent';
import { usePreferences } from './util/state/use-preferences';
import { usePreviousIssuer } from './util/state/use-previous-issuer';
import { useDocumentTitle } from './util/state/use-route-context';

interface AppControlsState {
  tools: {
    element: React.ReactNode | undefined;
    open: boolean;
    onChange: (e: NonCancelableCustomEvent<AppLayoutProps.ChangeDetail>) => void;
  };
  splitPanel: [string, React.ReactNode] | undefined;
  notification: {
    messages: Array<FlashbarProps.MessageDefinition>;
  };
}

const AppControlsStateContext = createContext<AppControlsState>({
  tools: {
    element: undefined,
    open: false,
    onChange: () => {},
  },
  splitPanel: undefined,
  notification: {
    messages: [],
  },
});

export interface RootLayoutProps extends Omit<AppLayoutProps, 'content'> {
  headerHide: boolean;
  breadcrumbsHide: boolean;
}

export function RootLayout({
  headerHide, breadcrumbsHide, children, ...appLayoutProps 
}: React.PropsWithChildren<RootLayoutProps>) {
  const { apiClient } = useHttpClient();
  const { notification } = useAppControls();

  const documentTitle = useDocumentTitle();
  const [authInfo] = useAuthInfo();
  const hasConsent = useHasConsent();
  const [cookiePrefVisible, setCookiePrefVisible] = useState(false);
  const isMobile = useMobile();
  const [splitPanelOpen, setSplitPanelOpen] = useState(true);
  const [isNavigationOpen, setNavigationOpen] = useState(!isMobile && (authInfo !== undefined && authInfo !== null));
  const appControlsState = useContext(AppControlsStateContext);

  useEffect(() => {
    const restore = document.title;
    document.title = documentTitle;
    return () => { document.title = restore; };
  }, [documentTitle]);

  useEffect(() => {
    setNavigationOpen(!isMobile && (authInfo !== undefined && authInfo !== null));
  }, [isMobile, authInfo]);

  useEffect(() => {
    (async () => {
      const { body } = expectSuccess(await apiClient.getNotifications());
      body.forEach((v) => notification.addOnce({
        type: v.type,
        header: v.header,
        content: v.content,
        dismissible: true,
      }));
    })().catch(catchNotify(notification, 'Failed to load notifications'));
  }, [apiClient, notification]);

  function onCookiePreferencesClick(e: CustomEvent<LinkProps.FollowDetail>) {
    e.preventDefault();
    setCookiePrefVisible(true);
  }

  return (
    <>
      {!headerHide && <Gw2AuthHeader />}
      <HeaderSelectorFixAppLayout
        toolsHide={appControlsState.tools.element === undefined}
        tools={appControlsState.tools.element}
        toolsOpen={appControlsState.tools.element !== undefined && appControlsState.tools.open}
        onToolsChange={appControlsState.tools.onChange}
        splitPanel={
          appControlsState.splitPanel !== undefined
            ? <SplitPanel header={appControlsState.splitPanel[0]} hidePreferencesButton={true}>{appControlsState.splitPanel[1]}</SplitPanel>
            : undefined
        }
        splitPanelOpen={appControlsState.splitPanel !== undefined && splitPanelOpen}
        splitPanelPreferences={{ position: 'side' }}
        onSplitPanelToggle={(e) => setSplitPanelOpen(e.detail.open)}
        headerSelector={headerHide ? undefined : '#gw2auth-custom-header'}
        stickyNotifications={true}
        notifications={<Flashbar stackItems={true} items={appControlsState.notification.messages} />}
        breadcrumbs={breadcrumbsHide ? undefined : <Breadcrumb />}
        navigationHide={authInfo === undefined || authInfo === null}
        navigation={<SideNav />}
        navigationOpen={isNavigationOpen}
        onNavigationChange={(e) => setNavigationOpen(e.detail.open)}
        content={children}
        headerVariant={'high-contrast'}
        {...appLayoutProps}
      />
      <CookiePreferences onDismiss={() => setCookiePrefVisible(false)} visible={cookiePrefVisible} />
      {!hasConsent && <CookieBanner onCustomizeClick={() => setCookiePrefVisible(true)} />}
      <Gw2AuthFooter onCookiePreferencesClick={onCookiePreferencesClick} />
    </>
  );
}

function HeaderSelectorFixAppLayout(props: AppLayoutProps) {
  const { headerSelector, ...appLayoutProps } = props;
  const [key, setKey] = useState(`a${Date.now()}-${Math.random()}`);

  useEffect(() => {
    setKey(`a${Date.now()}-${Math.random()}`);
  }, [headerSelector]);

  return (
    <AppLayout key={key} headerSelector={headerSelector} {...appLayoutProps} />
  );
}

export function BaseProviders({ children }: React.PropsWithChildren) {
  return (
    <BrowserStoreProvider storage={window.localStorage}>
      <HttpClientProvider>
        <InternalBaseProviders>
          {children}
        </InternalBaseProviders>
      </HttpClientProvider>
    </BrowserStoreProvider>
  );
}

function InternalBaseProviders({ children }: React.PropsWithChildren) {
  const { apiClient } = useHttpClient();
  const [preferences] = usePreferences();
  const [authInfo, setAuthInfo] = useState<AuthInfo | null | undefined>(undefined);
  const [,setPreviousIssuer] = usePreviousIssuer();
  const [tools, setTools] = useState<React.ReactNode>();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [splitPanel, setSplitPanel] = useState<[string, React.ReactNode]>();
  const [notificationMessages, setNotificationMessages] = useState<Array<FlashbarProps.MessageDefinition>>([]);

  function setAuthInfoInternal(newValue: (AuthInfo | null) | ((prevState: (AuthInfo | null | undefined)) => (AuthInfo | null))) {
    setAuthInfo(newValue);
  }

  useEffect(() => {
    document.getElementById('temp_style')?.remove();
  }, []);

  useEffect(() => {
    applyMode(preferences.effectiveColorScheme === ColorScheme.LIGHT ? Mode.Light : Mode.Dark, document.documentElement);
    applyDensity(preferences.uiDensity === UIDensity.COMFORTABLE ? Density.Comfortable : Density.Compact, document.documentElement);
  }, [preferences]);

  useEffect(() => {
    (async () => {
      const resp = await apiClient.getAuthInfo();
      if (resp.body !== undefined) {
        setAuthInfo(resp.body);
      } else {
        setAuthInfo(null);
      }
    })().catch(() => setAuthInfo(null));
  }, [apiClient]);

  useEffect(() => {
    if (authInfo !== undefined && authInfo !== null) {
      setPreviousIssuer(authInfo.issuer);
    }
  }, [authInfo]);

  const appControlsState = useMemo<AppControlsState>(() => ({
    tools: {
      element: tools,
      open: toolsOpen,
      onChange(e): void {
        setToolsOpen(e.detail.open);
      },
    },
    splitPanel: splitPanel,
    notification: {
      messages: notificationMessages,
    },
  }), [tools, toolsOpen, splitPanel, notificationMessages]);

  return (
    <CSI18nProvider locale={preferences.effectiveLocale} messages={[enMessages, deMessages, customI18nMessages]}>
      <I18nProvider locale={preferences.effectiveLocale} messages={I18N_GW2AUTH}>
        <AuthInfoProvider value={[authInfo, setAuthInfoInternal]}>
          <AppControlsProvider
            setTools={setTools}
            setToolsOpen={setToolsOpen}
            setSplitPanel={setSplitPanel}
            setNotificationMessages={setNotificationMessages}
          >
            <AppControlsStateContext.Provider value={appControlsState}>
              {children}
            </AppControlsStateContext.Provider>
          </AppControlsProvider>
        </AuthInfoProvider>
      </I18nProvider>
    </CSI18nProvider>
  );
}
