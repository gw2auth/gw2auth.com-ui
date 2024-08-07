import { BreadcrumbGroupProps } from '@cloudscape-design/components';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { I18nFormats, I18nRoute } from '../../../lib/i18n/i18n.model';
import { useI18n } from '../context/i18n';

interface RouteElement {
  path: string | RegExp;
  title?: string | ((part: string, i18n: I18nFormats) => string);
  breadcrumb?: string | ((part: string, i18n: I18nFormats) => string);
  children?: readonly RouteElement[];
}

function i18nTitle(fn: (i18n: I18nFormats) => I18nRoute) {
  return (_: string, i18n: I18nFormats) => {
    const v = fn(i18n);
    if (typeof v === 'string') {
      return v;
    }

    return v.title;
  };
}

function i18nBreadcrumb(fn: (i18n: I18nFormats) => I18nRoute) {
  return (_: string, i18n: I18nFormats) => {
    const v = fn(i18n);
    if (typeof v === 'string') {
      return v;
    }

    return v.breadcrumb;
  };
}

const ROUTES = [{
  path: '',
  breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.home),
  children: [
    // region account
    {
      path: 'accounts',
      title: i18nTitle((i18n) => i18n.routes.gw2Accounts),
      breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.gw2Accounts),
      children: [
        {
          path: 'add',
          title: i18nTitle((i18n) => i18n.routes.addGw2Account),
          breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.addGw2Account),
        },
      ],
    },
    {
      path: 'verification',
      title: i18nTitle((i18n) => i18n.routes.verification),
      breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.verification),
      children: [
        {
          path: 'new',
          title: i18nTitle((i18n) => i18n.routes.newVerification),
          breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.newVerification),
        },
        {
          path: 'pending',
          title: i18nTitle((i18n) => i18n.routes.pendingVerification),
          breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.pendingVerification),
        },
      ],
    },
    {
      path: 'applications',
      title: i18nTitle((i18n) => i18n.routes.applications),
      breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.applications),
    },
    {
      path: 'settings',
      title: i18nTitle((i18n) => i18n.routes.settings),
      breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.settings),
    },
    // endregion
    // region dev
    {
      path: 'dev',
      children: [
        {
          path: 'applications',
          title: i18nTitle((i18n) => i18n.routes.devApplications),
          breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.devApplications),
          children: [
            {
              path: 'create',
              title: i18nTitle((i18n) => i18n.routes.createDevApplication),
              breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.createDevApplication),
            },
            {
              path: /^.*$/,
              breadcrumb: (part) => part,
              children: [
                {
                  path: 'clients',
                  children: [
                    {
                      path: 'create',
                      title: i18nTitle((i18n) => i18n.routes.createDevClient),
                      breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.createDevClient),
                    },
                    {
                      path: /^.*$/,
                      breadcrumb: (part) => part,
                      children: [
                        {
                          path: 'test',
                          title: i18nTitle((i18n) => i18n.routes.testDevClient),
                          breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.testDevClient),
                          children: [
                            {
                              path: 'callback',
                              breadcrumb: 'Callback',
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
                      title: i18nTitle((i18n) => i18n.routes.createDevApiKey),
                      breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.createDevApiKey),
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
      title: i18nTitle((i18n) => i18n.routes.legal),
      breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.legal),
    },
    {
      path: 'privacy-policy',
      title: i18nTitle((i18n) => i18n.routes.privacyPolicy),
      breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.privacyPolicy),
    },
    {
      path: 'error',
      title: i18nTitle((i18n) => i18n.routes.error),
      breadcrumb: i18nBreadcrumb((i18n) => i18n.routes.error),
    },
    // endregion
  ],
}] satisfies readonly RouteElement[];

export function useRouteContext() {
  const i18n = useI18n();
  const location = useLocation();
  
  return useMemo(() => {
    let titlePrefix: string | undefined;
    const breadcrumbItems: BreadcrumbGroupProps.Item[] = [];

    if (location.pathname !== '/') {
      const parts = location.pathname.split('/').map(decodeURIComponent);

      let href = '';
      let routes: readonly RouteElement[] | undefined = ROUTES;

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
            if (matchedRoute.title !== undefined) {
              if (typeof matchedRoute.title === 'function') {
                titlePrefix = matchedRoute.title(part, i18n);
              } else {
                titlePrefix = matchedRoute.title;
              }
            }

            if (matchedRoute.breadcrumb !== undefined) {
              let text: string;
              if (typeof matchedRoute.breadcrumb === 'function') {
                text = matchedRoute.breadcrumb(part, i18n);
              } else {
                text = matchedRoute.breadcrumb;
              }

              breadcrumbItems.push({
                text: text,
                href: currentHref,
              });
            }

            ignorePart = true;
          }

          routes = matchedRoute?.children;
        }

        if (!ignorePart) {
          breadcrumbItems.push({
            text: part,
            href: currentHref,
          });
        }

        href = currentHref;
      }
    }

    return {
      documentTitle: titlePrefix !== undefined ? `${titlePrefix} • GW2Auth` : 'GW2Auth',
      breadcrumbItems: breadcrumbItems,
    } as const;
  }, [location, i18n]);
}

export function useDocumentTitle() {
  const { documentTitle } = useRouteContext();
  return documentTitle;
}

export function useBreadcrumbItems() {
  const { breadcrumbItems } = useRouteContext();
  return breadcrumbItems;
}
