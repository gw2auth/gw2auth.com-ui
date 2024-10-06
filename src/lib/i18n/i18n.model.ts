import React from 'react';
import { AuthInfo, Gw2ApiPermission, Issuer } from '../api/api.model';
import {
  ColorScheme, DateFormat, EffectiveLocale, Locale, UIDensity,
} from '../preferences.model';

interface I18nRouteExplicit {
  title: string,
  breadcrumb: string,
}

export type I18nRoute = string | I18nRouteExplicit;

export interface I18nFormats {
  locale: EffectiveLocale,
  general: {
    issuerName: (v: Issuer) => string,
    date: (d: Date) => string,
    time: (d: Date) => string,
    dateTime: (d: Date) => string,
    failedToLoad: (name: string) => string,
    externalIconAriaLabel: string,
    save: string,
    cancel: string,
    loading: string,
    submit: string,
    none: string,
    add: string,
    continue: string,
    details: string,
    actions: string,
    view: string,
    delete: string,
  },
  gw2: {
    lang: string,
    permissionDescription: (v: Gw2ApiPermission) => string,
  },
  routes: {
    home: I18nRoute,
    gw2Accounts: I18nRoute,
    addGw2Account: I18nRoute,
    verification: I18nRoute,
    newVerification: I18nRoute,
    pendingVerification: I18nRoute,
    applications: I18nRoute,
    settings: I18nRoute,
    devApplications: I18nRoute,
    createDevApplication: I18nRoute,
    createDevClient: I18nRoute,
    testDevClient: I18nRoute,
    createDevApiKey: I18nRoute,
    legal: I18nRoute,
    privacyPolicy: I18nRoute,
    error: I18nRoute;
  },
  pages: {
    applications: {
      pageHeader: string,
      tableHeader: string,
      tableColumns: {
        id: string,
        name: string,
        userId: string,
        lastUsed: string,
        authorizedScopes: string,
      },
      never: string,
      noApplicationsAuthorized: string,
    },
    applicationsDetail: {
      entity: string,
      userId: string,
      lastUsed: string,
      authorizedScopes: string,
      authorizedGw2Accounts: string,
      authorizedGw2AccountsTableColumns: {
        name: string,
        displayName: string,
      },
      never: string,
      noGw2AccountsAuthorized: string,
      revokeAccess: string,
      revokeAccessInProgress: string,
      revokeAccessSuccess: string,
      revokeAccessFailed: string,
      revokeAccessInfo: React.ReactNode,
    },
    gw2Accounts: {
      pageHeader: string,
      tableHeader: string,
      addApiToken: string,
      tableColumns: {
        id: string,
        name: string,
        displayName: string,
        verificationStatus: string,
        authorizedApplications: string,
        apiToken: string,
        created: string,
      },
      noGw2AccountsAddedYet: string,
    },
    gw2AccountsDetail: {
      entity: string,
      id: string,
      created: string,
      verificationStatus: string,
      displayName: {
        label: string,
        description: string,
      },
      apiToken: {
        label: string,
        description: string,
      },
      authorizedApplications: string,
      authorizedApplicationsTableColumns: {
        name: string,
        lastUsed: string,
      },
      formErrors: {
        canNotBeEmpty: string,
        canNotBeLongerThan: (maxLen: number) => string,
      },
      submitErrors: {
        apiTokenInvalid: string,
        apiTokenForDifferentGw2Account: string,
      },
      deleteApiToken: string,
      deleteApiTokenInProgress: string,
      deleteApiTokenSuccess: string,
      deleteApiTokenFailed: string,
      deleteApiTokenWarn: React.ReactNode,
      deleteApiTokenInfo: React.ReactNode,
      noApplicationsAuthorized: string,
      selectApiToken: {
        header: string,
        warning: React.ReactNode,
        keepCurrent: {
          label: string,
          description: string,
        },
        saveNew: {
          label: string,
          description: string,
        },
      },
    },
    settings: {
      header: string,
      loginProvidersHeader: string,
      sessionsHeader: string,
      addLoginProvider: string,
      loginProviderName: (issuer: Issuer) => string,
      deleteLoginProviderLoading: string,
      deleteLoginProviderSuccess: string,
      deleteLoginProviderFailed: string,
      deleteSessionLoading: string,
      deleteSessionSuccess: string,
      deleteSessionFailed: string,
      loginProviderTableColumns: {
        issuer: string,
        idAtIssuer: string,
      },
      sessionTableColumns: {
        current: string,
        id: string,
        issuer: string,
        idAtIssuer: string,
        createdAt: string,
      },
    },
    home: {
      a: string,
    },
    legal: {
      lastUpdated: (time: string) => string,
      copyrightGw2: ReadonlyArray<string>,
    },
    privacyPolicy: {
      lastUpdated: (time: string) => string,
    },
  },
  components: {
    addApiToken: {
      tokenVerification: string,
      successVerified: string,
      successNotVerified: string,
      failed: string,
      wizard: {
        gw2Login: {
          title: string,
          description: string,
          content: (Gw2AccountPageLink: React.FunctionComponent<React.PropsWithChildren>) => React.ReactNode,
        },
        createToken: {
          title: string,
          description: string,
        },
        assignNameAndPermissions: {
          title: string,
          description: string,
          formFieldName: string,
          formFieldDescription: string,
          anyName: string,
          permissionInfo: React.ReactNode,
        },
        copyToken: {
          title: string,
          description: string,
        },
        addToken: {
          title: string,
          description: string,
          formFieldName: string,
          formFieldDescription: string,
        },
      },
    },
    assets: {
      srcBase: string,
      gw2Login: {
        anetGw2Account: React.ReactNode,
        steamGw2Account: React.ReactNode,
      },
      createApiToken1: {
        text: string,
      },
      createApiToken2: {
        assignName: string,
        assignPermissions: string,
        create: string,
      },
      createApiToken3: {
        text: string,
      },
      tradingpost: {
        makeSureToMatchPrice: React.ReactNode,
        placeBuyOrder: string,
      },
    },
    copy: {
      success: string,
      failed: string,
      inProgress: string,
    },
    confirmationModal: {
      confirmDeletionHeader: (v: string) => string,
      confirmDeletionShort: (v: string) => string,
      confirmDeletionLong: (v: string) => string,
    },
    hidden: {
      show: string,
    },
    verificationStatus: {
      verified: {
        label: string,
        content: React.ReactNode,
      },
      unverified: {
        label: string,
        content: (Link: React.FunctionComponent<React.PropsWithChildren>) => React.ReactNode,
      },
      pending: {
        label: string,
        content: (Link: React.FunctionComponent<React.PropsWithChildren>) => React.ReactNode,
      },
    },
    contact: {
      ingame: string,
      discord: string,
      discordDetail: (Link: React.FunctionComponent<React.PropsWithChildren>) => React.ReactNode,
      email: string,
      emailDetail: (Link: React.FunctionComponent) => React.ReactNode,
    },
    cookieBanner: {
      header: string,
      content: string,
      denyOptional: string,
      customize: string,
      acceptAll: string,
    },
    cookiePreferences: {
      header: string,
      subTitle: string,
      denyOptional: string,
      allowed: string,
      essential: {
        name: string,
        description: string,
      },
      functional: {
        name: string,
        description: string,
      },
      learnMore: (Link: React.FunctionComponent<React.PropsWithChildren>) => React.ReactNode,
    },
    devAppApprovalType: {
      _public: {
        label: string,
        detail: string,
      },
      required: {
        label: string,
        detail: string,
      },
    },
    devAppRedirectURIs: {
      additionalInfo: string,
    },
    footer: {
      legal: string,
      privacyPolicy: string,
      faq: string,
      developerWiki: string,
      cookiePreferences: string,
      copyrightGw2Auth: string,
      copyrightGw2: ReadonlyArray<string>,
    },
    header: {
      github: string,
      preferences: string,
      login: string,
      logout: string,
      account: string,
      accountDescription: (v: AuthInfo, dateFormat: (v: string | Date) => string) => string,
    },
    login: {
      loginWith: (v: Issuer) => string,
      noPreviousWarning: React.ReactNode,
      previousWarning: (v: Issuer) => React.ReactNode,
      moreOptions: string,
    },
    preferences: {
      header: string,
      functionalCookieWarning: React.ReactNode,
      locale: {
        category: string,
        name: (v: Locale) => string,
      },
      dateAndTime: {
        category: string,
        name: (v: DateFormat) => string,
      },
      theme: {
        category: string,
        name: (v: ColorScheme) => string,
        description: (v: ColorScheme) => string,
      },
      density: {
        category: string,
        name: (v: UIDensity) => string,
        description: (v: UIDensity) => string,
      },
    },
    scopes: {
      displayName: {
        label: string,
        description: string,
      },
      verificationStatus: {
        label: string,
        description: string,
      },
      gw2ApiAccess: {
        label: string,
      },
    },
    sidenav: {
      account: string,
      gw2Accounts: string,
      gw2AccountVerification: string,
      applications: string,
      settings: string,
      developer: string,
      devApplications: string,
    },
    errorNotificationContent: {
      status: string,
      requestId: string,
    },
    verification: {
      activeChallenge: string,
      newChallenge: string,
      challenge: string,
      itemInfo: string,
      recommended: string,
      backToOverview: string;
      challenges: {
        tokenName: {
          label: string,
          description: string,
        },
        tpBuyOrder: {
          label: string,
          description: string,
        },
        characterName: {
          label: string,
          description: string,
        },
      },
      wizard: {
        videoGuide: {
          title: string,
          description: string,
        },
        enterApiToken: {
          title: string,
          description: string,
          formFieldName: string,
          formFieldDescription: string,
        },
        gw2GameLogin: {
          title: string,
          description: string,
          content: string,
        },
        placeBuyOrder: {
          title: (name: string) => string,
          description: (name: string) => string,
          content: (CopyNameButton: React.FunctionComponent, PriceElement: React.FunctionComponent) => React.ReactNode,
          footNode: string,
        },
        createCharacter: {
          title: (name: string) => string,
          description: (name: string) => string,
          content: (CopyNameButton: React.FunctionComponent) => React.ReactNode,
          footNode: string,
        },
        createApiTokenInfo: {
          title: string,
          description: string,
          content: React.ReactNode,
        },
        selectApiToken: {
          formFieldName: string,
          formFieldDescription: string,
          noneAvailable: string,
        },
        selectOrEnterApiToken: {
          title: string,
          description: string,
          infoWillOnlyBeUsedForVerification: React.ReactNode,
        },
        createApiToken: {
          gw2Login: {
            title: string,
            description: string,
            content: (Link: React.FunctionComponent<React.PropsWithChildren>) => React.ReactNode,
          },
          createToken: {
            title: string,
            description: string,
          },
          assignNameAndPermissions: {
            title: string,
            description: string,
            nameFormFieldName: string,
            nameFormFieldDescription: string,
            permissionsFormFieldName: string,
            permissionsFieldDescription: string,
            anyName: string,
          },
          copyToken: {
            title: string,
            description: string,
          },
        },
        actions: {
          submitInProgress: string,
          succeeded: string,
          inProgress: string,
          failedToSubmit: string,
        },
      },
    },
  },
}

export type I18n = Record<EffectiveLocale, I18nFormats>;
