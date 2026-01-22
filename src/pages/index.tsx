import { applyMode, Mode } from '@cloudscape-design/global-styles';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter, Navigate, Outlet, RouterProvider,
} from 'react-router-dom';
import '@cloudscape-design/global-styles/index.css';
import { BaseProviders, RootLayout } from '../components/root';
import { MustAuthInfoProvider, MustNotAuthInfo } from '../components/util/context/auth-info';
import { Applications } from './account/applications';
import { ApplicationsDetail } from './account/applications-detail';
import { Gw2Accounts } from './account/gw2-accounts';
import { Gw2AccountsAdd } from './account/gw2-accounts-add';
import { Gw2AccountsDetail } from './account/gw2-accounts-detail';
import { Settings } from './account/settings';
import { Gw2AccountVerification } from './account/verification';
import { Gw2AccountVerificationNew } from './account/verification-new';
import { Gw2AccountVerificationPending } from './account/verification-pending';
import { DevApplications } from './developer/applications';
import { DevApplicationsAPIKeysCreate } from './developer/applications-apikeys-create';
import { DevApplicationsClientsCreate } from './developer/applications-clients-create';
import { DevApplicationsClientsDetail } from './developer/applications-clients-detail';
import { DevApplicationsCreate } from './developer/applications-create';
import { DevApplicationsDetail } from './developer/applications-detail';
import { ClientTest } from './developer/test/client-test';
import { ClientTestCallback } from './developer/test/client-test-callback';
import { ErrorPage, ErrorLayout } from './error-page';
import Home from './home';
import Legal from './legal';
import { Login } from './login';
import { OAuth2Consent } from './oauth2-consent';
import { PrivacyPolicy } from './privacy-policy';

// region router
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RootLayout headerHide={false} breadcrumbsHide={false}>
        <Outlet />
      </RootLayout>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'legal',
        element: <Legal />,
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />,
      },
      {
        path: 'error',
        element: <ErrorLayout backendError={true} />,
      },
      {
        path: '',
        element: (
          <MustAuthInfoProvider>
            <Outlet />
          </MustAuthInfoProvider>
        ),
        children: [
          // region account
          {
            path: 'accounts',
            element: <Gw2Accounts />,
          },
          {
            path: 'accounts/add',
            element: <Gw2AccountsAdd />,
          },
          {
            path: 'accounts/:id',
            element: <Gw2AccountsDetail />,
          },
          {
            path: 'verification',
            element: <Gw2AccountVerification />,
          },
          {
            path: 'verification/new',
            element: <Gw2AccountVerificationNew />,
          },
          {
            path: 'verification/pending',
            element: <Gw2AccountVerificationPending />,
          },
          {
            path: 'applications',
            element: <Applications />,
          },
          {
            path: 'applications/:id',
            element: <ApplicationsDetail />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
          // endregion
          // region developer
          {
            path: 'dev/applications',
            element: <DevApplications />,
          },
          {
            path: 'dev/applications/create',
            element: <DevApplicationsCreate />,
          },
          {
            path: 'dev/applications/:id',
            element: <DevApplicationsDetail />,
          },
          {
            path: 'dev/applications/:id/clients/create',
            element: <DevApplicationsClientsCreate />,
          },
          {
            path: 'dev/applications/:applicationId/clients/:clientId',
            element: <DevApplicationsClientsDetail />,
          },
          {
            path: 'dev/applications/:applicationId/clients/:clientId/test',
            element: <ClientTest />,
          },
          {
            path: 'dev/applications/:applicationId/clients/:clientId/test/callback',
            element: <ClientTestCallback />,
          },
          {
            path: 'dev/applications/:id/apikeys/create',
            element: <DevApplicationsAPIKeysCreate />,
          },
          // endregion
        ],
      },
    ],
  },
  {
    path: '/',
    element: (
      <RootLayout headerHide={true} breadcrumbsHide={true} navigationHide={true}>
        <Outlet />
      </RootLayout>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'login',
        element: (
          <MustNotAuthInfo>
            <Login />
          </MustNotAuthInfo>
        ),
      },
      {
        path: 'oauth2-consent',
        element: (
          <MustAuthInfoProvider>
            <OAuth2Consent />
          </MustAuthInfoProvider>
        ),
      },
    ],
  },
  {
    // login redirects here, keep it for compatability
    path: '/account',
    element: <Navigate to={'/accounts'} />,
  },
]);
// endregion

const root = ReactDOM.createRoot(document.getElementById('root')!);
const element = (
  <React.StrictMode>
    <BaseProviders>
      <RouterProvider router={router} />
    </BaseProviders>
  </React.StrictMode>
);

applyMode(Mode.Dark, document.body);
root.render(element);
