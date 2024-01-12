import { BreadcrumbGroup, BreadcrumbGroupProps } from '@cloudscape-design/components';
import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { I18nFormats } from '../../lib/i18n/i18n-strings';
import { useI18n } from '../util/context/i18n';

interface RouteElement {
  path: string | RegExp;
  text?: string | ((part: string, i18n: I18nFormats) => string);
  children?: ReadonlyArray<RouteElement>;
}

const ROUTES = [{
  path: '',
  text: 'Home',
  children: [
    // region account
    {
      path: 'profile',
      text: 'Profile',
    },
    {
      path: 'accounts',
      text: 'GW2 Accounts',
      children: [
        {
          path: 'add',
          text: 'Add',
        },
      ],
    },
    {
      path: 'verification',
      text: 'GW2 Account Verification',
      children: [
        {
          path: 'new',
          text: 'New',
        },
      ],
    },
    {
      path: 'applications',
      text: 'Applications',
    },
    {
      path: 'settings',
      text: 'Settings',
    },
    // endregion
    // region dev
    {
      path: 'dev',
      children: [
        {
          path: 'applications',
          text: 'Applications',
          children: [
            {
              path: 'create',
              text: 'Create',
            },
            {
              path: /^.*$/,
              text: (part) => part,
              children: [
                {
                  path: 'clients',
                  children: [
                    {
                      path: 'create',
                      text: 'Create Client',
                    },
                    {
                      path: /^.*$/,
                      text: (part) => part,
                      children: [
                        {
                          path: 'test',
                          text: 'Test Client',
                          children: [
                            {
                              path: 'callback',
                              text: 'Callback',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'apikeys',
                  children: [
                    {
                      path: 'create',
                      text: 'Create API Key',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    // endregion
    // region general
    {
      path: 'legal',
      text: 'Legal',
    },
    {
      path: 'privacy-policy',
      text: 'Privacy Policy',
    },
    // endregion
  ],
}] satisfies ReadonlyArray<RouteElement>;

export function Breadcrumb() {
  const i18n = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const items = useMemo(() => {
    if (location.pathname === '/') {
      return [];
    }

    const parts = location.pathname.split('/').map(decodeURIComponent);
    const result: Array<BreadcrumbGroupProps.Item> = [];

    let href = '';
    let routes: ReadonlyArray<RouteElement> | undefined = ROUTES;

    for (const part of parts) {
      if (!href.endsWith('/')) {
        href += '/';
      }

      const currentHref = `${href}${encodeURIComponent(part)}`;
      let ignorePart = false;

      if (routes !== undefined) {
        let matchedRoute: RouteElement | undefined;

        for (const route of routes) {
          if ((route.path instanceof RegExp && route.path.test(part)) || route.path === part) {
            matchedRoute = route;
            break;
          }
        }

        if (matchedRoute !== undefined) {
          if (matchedRoute.text !== undefined) {
            let text: string;
            if (typeof matchedRoute.text === 'function') {
              text = matchedRoute.text(part, i18n);
            } else {
              text = matchedRoute.text;
            }

            result.push({
              text: text,
              href: currentHref,
            });
          }

          ignorePart = true;
        }

        routes = matchedRoute?.children;
      }

      if (!ignorePart) {
        result.push({
          text: part,
          href: currentHref,
        });
      }

      href = currentHref;
    }

    return result;
  }, [location, i18n]);

  if (items.length < 2) {
    return undefined;
  }

  return (
    <BreadcrumbGroup
      items={items}
      onFollow={(e) => {
        e.preventDefault();
        navigate(e.detail.href);
      }}
    />
  );
}
