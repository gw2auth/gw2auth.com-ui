import { Box, Link } from '@cloudscape-design/components';
import React from 'react';
import { Issuer } from '../api/api.model';
import {
  ColorScheme, DateFormat, Locale, UIDensity,
} from '../preferences.model';
import { I18nFormats } from './i18n.model';

const CURRENT_YEAR = new Date().getFullYear();
const COMMON = {
  lastUpdated: (time: string) => `Last updated: ${time}`,
  issuerName: (issuer: Issuer) => ({
    [Issuer.GITHUB]: 'GitHub',
    [Issuer.GOOGLE]: 'Google',
    [Issuer.COGNITO]: 'E-Mail & Password',
  })[issuer] ?? 'unknown',
  copyrightGw2: [
    'This site is not affiliated with ArenaNet, Guild Wars 2, or any of their partners. All copyrights reserved to their respective owners.',
    '© ArenaNet LLC. All rights reserved. NCSOFT, ArenaNet, Guild Wars, Guild Wars 2, GW2, Guild Wars 2: Heart of Thorns, Guild Wars 2: Path of Fire, Guild Wars 2: End of Dragons, and Guild Wars 2: Secrets of the Obscure and all associated logos, designs, and composite marks are trademarks or registered trademarks of NCSOFT Corporation.',
  ],
} as const;

export const I18N_EN = ({
  locale: Locale.EN,
  general: {
    issuerName: COMMON.issuerName,
    date: (d) => d.toLocaleDateString('en-US'),
    time: (d) => d.toLocaleTimeString('en-US'),
    dateTime: (d) => d.toLocaleString('en-US'),
    failedToLoad: (name) => `Failed to load ${name}`,
    externalIconAriaLabel: '(opens in a new tab)',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading',
    submit: 'Submit',
    none: 'None',
    add: 'Add',
    continue: 'Continue',
    details: 'Details',
    actions: 'Actions',
    view: 'View',
    delete: 'Delete',
  },
  gw2: {
    lang: 'en',
    permissionDescription: (v) => ({
      account: 'Your account display name, ID, home world, and list of guilds',
      builds: 'Your currently equipped specializations, traits, skills, and equipment for all game modes',
      characters: 'Basic information about your characters',
      guilds: 'Guilds\' rosters, history, and MOTDs for all guilds you are a member of',
      inventories: 'Your account bank, material storage, recipe unlocks, and character inventories',
      progression: 'Your achievements, dungeon unlock status, mastery point assignments, and general PvE progress',
      pvp: 'Your PvP stats, match history, reward track progression, and custom arena details',
      wvw: 'Your selected WvW guild, assigned team, and personal WvW information.',
      tradingpost: 'Your Trading Post transactions',
      unlocks: 'Your wardrobe unlocks—skins, dyes, minipets, finishers, etc.—and currently equipped skins',
      wallet: 'Your account\'s wallet',
    })[v] ?? 'unknown',
  },
  routes: {
    home: 'Home',
    gw2Accounts: 'GW2 Accounts',
    addGw2Account: { title: 'Add GW2 Account', breadcrumb: 'Add' },
    verification: { title: 'Verification', breadcrumb: 'GW2 Account Verification' },
    newVerification: { title: 'New GW2 Account Verification', breadcrumb: 'New' },
    pendingVerification: { title: 'Pending GW2 Account Verification', breadcrumb: 'Pending' },
    applications: 'Applications',
    settings: 'Settings',
    devApplications: 'Applications',
    createDevApplication: { title: 'Create Application', breadcrumb: 'Create' },
    createDevClient: { title: 'Create Client', breadcrumb: 'Create' },
    testDevClient: { title: 'Test Client', breadcrumb: 'Test' },
    createDevApiKey: 'Create API Key',
    legal: 'Legal',
    privacyPolicy: 'Privacy Policy',
    error: 'Error',
  },
  pages: {
    applications: {
      pageHeader: 'Authorized Applications',
      tableHeader: 'Applications',
      tableColumns: {
        id: 'ID',
        name: 'Name',
        userId: 'User ID',
        lastUsed: 'Last Used',
        authorizedScopes: 'Authorized Scopes',
      },
      never: 'Never',
      noApplicationsAuthorized: 'No applications authorized yet',
    },
    applicationsDetail: {
      entity: 'Authorized Application',
      userId: 'User ID',
      lastUsed: 'Last Used',
      authorizedScopes: 'Authorized Scopes',
      authorizedGw2Accounts: 'Authorized Guild Wars 2 Accounts',
      authorizedGw2AccountsTableColumns: {
        name: 'Name',
        displayName: 'Display Name',
      },
      never: 'Never',
      noGw2AccountsAuthorized: 'No GW2 Accounts authorized',
      revokeAccess: 'Revoke Access',
      revokeAccessInProgress: 'Revoking access...',
      revokeAccessSuccess: 'Access was revoked',
      revokeAccessFailed: 'Failed to revoke access',
      revokeAccessInfo: (
        <Box>Authorized applications may still be able to use an already issued API Token for at most 30 minutes after deletion of this authorization.</Box>
      ),
    },
    gw2Accounts: {
      pageHeader: 'Guild Wars 2 Accounts',
      tableHeader: 'Accounts',
      addApiToken: 'Add API Token',
      tableColumns: {
        id: 'ID',
        name: 'Name',
        displayName: 'Display Name',
        verificationStatus: 'Verification Status',
        authorizedApplications: 'Authorized Applications',
        apiToken: 'API Token',
        created: 'Created',
      },
      noGw2AccountsAddedYet: 'No Guild Wars 2 Accounts added yet',
    },
    gw2AccountsDetail: {
      entity: 'API Token',
      id: 'ID',
      created: 'Created',
      verificationStatus: 'Verification Status',
      displayName: {
        label: 'Display Name',
        description: 'A custom name for this GW2 Account, can be shared with applications',
      },
      apiToken: {
        label: 'API Token',
        description: '',
      },
      authorizedApplications: 'Authorized Applications',
      authorizedApplicationsTableColumns: {
        name: 'Name',
        lastUsed: 'Last Used',
      },
      formErrors: {
        canNotBeEmpty: 'Can not be empty',
        canNotBeLongerThan: (maxLen) => `Can not be longer than ${maxLen} characters`,
      },
      submitErrors: {
        apiTokenInvalid: 'The provided API Token is invalid',
        apiTokenForDifferentGw2Account: 'The provided API Token belongs to a different Guild Wars 2 Account',
      },
      deleteApiToken: 'Delete API Token',
      deleteApiTokenInProgress: 'Deleting API Token...',
      deleteApiTokenSuccess: 'Your API Token was deleted',
      deleteApiTokenFailed: 'Failed to delete your API Token',
      deleteApiTokenWarn: (
        <>
          <Box>Deleting an API Token for an Guild Wars 2 Account which is used by an application <Box variant={'strong'}>will likely cause issues</Box> with the application(s) using it.</Box>
          <Box>If you wish to use a new API Token instead, <Box variant={'strong'}>please use the in-place update instead</Box> to prevent any issues.</Box>
        </>
      ),
      deleteApiTokenInfo: (
        <Box>Authorized applications may still be able to use an already issued API Token for at most 30 minutes after deletion of this API Token.</Box>
      ),
      noApplicationsAuthorized: 'No applications authorized for this Guild Wars 2 Account',
      selectApiToken: {
        header: 'Select API Token',
        warning: (
          <>
            <Box>Reducing the permissions of the API Token provided to GW2Auth <Box variant={'strong'}>may cause issues</Box> with the application(s) using it.</Box>
            <Box>GW2Auth never shares the API Token itself with authorized applications. Instead, authorized applications are given <Link external={true} href={'https://wiki.guildwars2.com/wiki/API:2/createsubtoken'}>subtokens</Link> using the permissions you have authorized an application to use.</Box>
            <Box>It is recommended to use an API Token with all permissions for GW2Auth.</Box>
          </>
        ),
        keepCurrent: {
          label: 'Current',
          description: 'Keep the current API Token',
        },
        saveNew: {
          label: 'New',
          description: 'Save the new API Token',
        },
      },
    },
    settings: {
      header: 'Settings',
      loginProvidersHeader: 'Login Provider',
      sessionsHeader: 'Sessions',
      addLoginProvider: 'Add Login Provider',
      loginProviderName: COMMON.issuerName,
      deleteLoginProviderLoading: 'Deleting your Login Provider...',
      deleteLoginProviderSuccess: 'Your Login Provider was deleted!',
      deleteLoginProviderFailed: 'Failed to delete login provider',
      deleteSessionLoading: 'Deleting your Session...',
      deleteSessionSuccess: 'Your Login Provider was deleted!',
      deleteSessionFailed: 'Failed to delete session',
      loginProviderTableColumns: {
        issuer: 'Provider',
        idAtIssuer: 'ID at Provider',
      },
      sessionTableColumns: {
        current: 'Current',
        id: 'ID',
        issuer: 'Provider',
        idAtIssuer: 'ID at Provider',
        createdAt: 'Created At',
      },
    },
    home: {
      a: '',
    },
    legal: {
      lastUpdated: COMMON.lastUpdated,
      copyrightGw2: COMMON.copyrightGw2,
    },
    privacyPolicy: {
      lastUpdated: COMMON.lastUpdated,
    },
  },
  components: {
    addApiToken: {
      tokenVerification: 'Verification Info',
      successVerified: 'Your API Token was added successfully and the account ownership was verified!',
      successNotVerified: 'Your API Token was added successfully. The account ownership was not verified.',
      failed: 'Failed to add your API Token',
      wizard: {
        gw2Login: {
          title: 'Login on the GW2 Website',
          description: 'Login on the official website of Guild Wars 2 using the Guild Wars 2 Account you wish to add',
          content: (Gw2AccountPageLink) => (
            <Box>Visit the <Gw2AccountPageLink>Guild Wars 2 Account Page</Gw2AccountPageLink> and login using the Guild Wars 2 Account you wish to add.</Box>
          ),
        },
        createToken: {
          title: 'Create a new API Token',
          description: 'Click the button to create a new API Token',
        },
        assignNameAndPermissions: {
          title: 'Assign name and permissions',
          description: 'Assign a name and permissions. It is recommended to use an API Token with all permissions with GW2Auth',
          formFieldName: 'Token Name',
          formFieldDescription: 'Use this exact name for the API Token if you also wish to verify your account ownership. Please use this name UPON CREATION of the API Token since changing the name of an existing API Token is not immediately visible in the API.',
          anyName: 'Choose any name you like',
          permissionInfo: (
            <>
              <span>Assign permissions</span>
              <br />
              <span>It is recommended to provide GW2Auth with all permissions</span>
            </>
          ),
        },
        copyToken: {
          title: 'Copy the API Token',
          description: 'Click the button shown below to copy your newly created API Token',
        },
        addToken: {
          title: 'Add the API Token',
          description: 'Add the newly generated API Token to your GW2Auth Account',
          formFieldName: 'API Token',
          formFieldDescription: 'Paste the API Token here',
        },
      },
    },
    assets: {
      srcBase: '/assets/en',
      gw2Login: {
        anetGw2Account: (
          <>
            <span>ArenaNet GW2 Account?</span>
            <br />
            <span>Login via E-Mail & Passwort</span>
          </>
        ),
        steamGw2Account: (
          <>
            <span>Steam GW2 Account?</span>
            <br />
            <span>Login via Steam</span>
          </>
        ),
      },
      createApiToken1: {
        text: 'Create a new API Token',
      },
      createApiToken2: {
        assignName: 'Assign a name for the new API Token',
        assignPermissions: 'Grant required permissions',
        create: 'Create the API Token',
      },
      createApiToken3: {
        text: 'Click this button to copy the newly generated API Token to your clipboard',
      },
      tradingpost: {
        makeSureToMatchPrice: <span>Make sure the buy-order <strong>exactly</strong> matches the shown price</span>,
        placeBuyOrder: 'Place the buy-order',
      },
    },
    copy: {
      success: 'Copied!',
      failed: 'Failed to copy',
      inProgress: 'Copying...',
    },
    confirmationModal: {
      confirmDeletionHeader: (v) => `Confirm ${v} deletion`,
      confirmDeletionShort: () => 'Delete',
      confirmDeletionLong: (v) => `Please confirm the deletion of this ${v}`,
    },
    hidden: {
      show: 'Show',
    },
    verificationStatus: {
      verified: {
        label: 'Verified',
        content: (
          <>
            <Box variant={'p'}>You completed the verification process for this Guild Wars 2 Account.</Box>
            <Box variant={'p'}>GW2Auth will not allow API Tokens of this Guild Wars 2 Account to be added to different GW2Auth Accounts.</Box>
          </>
        ),
      },
      unverified: {
        label: 'Unverified',
        content: (XLink) => (
          <>
            <Box variant={'p'}>This Guild Wars 2 Account is not verified yet.</Box>
            <Box variant={'p'}>Applications might request reading your verification status to ensure you are the legitimate owner of this Guild Wars 2 Account.</Box>
            <Box variant={'p'}>They might also refuse to accept this Guild Wars 2 Account until you have completed the verification process.</Box>
            <Box variant={'p'}>You can start the verification process on the <XLink>verification page</XLink>.</Box>
          </>
        ),
      },
      pending: {
        label: 'Pending',
        content: (XLink) => (
          <>
            <Box variant={'p'}>You have submitted the verification for this Guild Wars 2 Account, but GW2Auth could not verify it yet.</Box>
            <Box variant={'p'}>Since the Guild Wars 2 API does not return real-time data, it might take some time until GW2Auth can complete the verification.</Box>
            <Box variant={'p'}>You can observe your pending verifications on the <XLink>verification page</XLink>.</Box>
          </>
        ),
      },
    },
    contact: {
      ingame: 'Ingame',
      discord: 'Discord',
      discordDetail: (XLink) => (
        <Box>Join the <XLink>GW2 Development Community</XLink> in channel <Box variant={'strong'}>#gw2auth</Box></Box>
      ),
      email: 'E-Mail',
      emailDetail: (XLink) => (
        <Box>Send us an E-Mail at <XLink /></Box>
      ),
    },
    cookieBanner: {
      header: 'Select your cookie preferences',
      content: 'We use cookies and local storage to provide basic functionality on this site, for example to allow you to stay logged in or to remember your preferences on this device.',
      denyOptional: 'Deny Optional',
      customize: 'Customize',
      acceptAll: 'Accept All',
    },
    cookiePreferences: {
      header: 'Cookie Preferences',
      subTitle: 'We use cookies and local storage for the following purposes',
      denyOptional: 'Deny Optional',
      allowed: 'Allowed',
      essential: {
        name: 'Essential',
        description: 'Essential cookies are necessary to provide our site and services and cannot be deactivated. They are usually set in response to your actions on the site, such as setting your privacy preferences, signing in, or filling in forms.',
      },
      functional: {
        name: 'Functional',
        description: 'Functional cookies help us provide useful site features and remember your preferences. If you do not allow these cookies, then some or all of these services may not function properly.',
      },
      learnMore: (XLink) => (
        <Box variant={'small'}>Learn more about the cookies and local storage we use by reading our <XLink>Privacy Policy</XLink>.</Box>
      ),
    },
    devAppApprovalType: {
      _public: {
        label: 'Public',
        detail: 'Users will be automatically approved on their first login',
      },
      required: {
        label: 'Approval Required',
        detail: 'Logins will be rejected until the user was approved by you',
      },
    },
    devAppRedirectURIs: {
      additionalInfo: 'You may add the following URI to be able to test this client on this site: ',
    },
    footer: {
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
      faq: 'FAQ',
      developerWiki: 'Developer Wiki',
      cookiePreferences: 'Cookie preferences',
      copyrightGw2Auth: `© ${CURRENT_YEAR} Felix.9127`,
      copyrightGw2: COMMON.copyrightGw2,
    },
    header: {
      github: 'GitHub',
      preferences: 'Preferences',
      login: 'Login',
      logout: 'Logout',
      account: 'Account',
      accountDescription: (authInfo, dateFormat) => `Signed in using ${COMMON.issuerName(authInfo.issuer)} since ${dateFormat(authInfo.sessionCreationTime)}`,
    },
    login: {
      loginWith: (v) => `Login with ${COMMON.issuerName(v)}`,
      noPreviousWarning: (
        <>
          <Box>If you logged in to GW2Auth before, <Box variant={'strong'}>please use the same login provider you have used before</Box>.</Box>
          <Box>If you never logged in to GW2Auth before, choose the login provider you would like to use the most.</Box>
        </>
      ),
      previousWarning: (v) => (
        <>
          <Box>You have logged in to GW2Auth using <Box variant={'strong'}>{COMMON.issuerName(v)}</Box> before.</Box>
          <Box>Logging in using a login provider which is not yet linked to your GW2Auth account will create a new GW2Auth account.</Box>
          <Box>If you want to add an additional login provider to your GW2Auth account, please login using a known login provider first and navigate to your account settings to add the one you wish to use.</Box>
        </>
      ),
      moreOptions: 'More options',
    },
    preferences: {
      header: 'Preferences',
      functionalCookieWarning: (
        <Box>You have not given permission for <Box variant={'strong'}>functional cookies</Box>. Your choice <Box variant={'strong'}>will not persist</Box> across page loads.</Box>
      ),
      locale: {
        category: 'Locale',
        name: (v) => ({
          [Locale.SYSTEM]: 'System',
          [Locale.EN]: 'English',
          [Locale.DE]: 'Deutsch',
        })[v] ?? 'unknown',
      },
      dateAndTime: {
        category: 'Date and Time Format',
        name: (v) => ({
          [DateFormat.SYSTEM]: 'System',
          [DateFormat.LOCALE]: 'Locale',
          [DateFormat.ISO_8601]: 'ISO',
        })[v] ?? 'unknown',
      },
      theme: {
        category: 'Theme',
        name: (v) => ({
          [ColorScheme.SYSTEM]: 'System',
          [ColorScheme.LIGHT]: 'Light',
          [ColorScheme.DARK]: 'Dark',
        })[v] ?? 'unknown',
        description: (v: ColorScheme) => ({
          [ColorScheme.SYSTEM]: 'Use your system default theme',
          [ColorScheme.LIGHT]: 'Classic light theme',
          [ColorScheme.DARK]: 'Classic dark theme',
        })[v] ?? 'unknown',
      },
      density: {
        category: 'Density',
        name: (v) => ({
          [UIDensity.COMFORTABLE]: 'Comfortable',
          [UIDensity.COMPACT]: 'Compact',
        })[v] ?? 'unknown',
        description: (v) => ({
          [UIDensity.COMFORTABLE]: 'Standard spacing',
          [UIDensity.COMPACT]: 'Reduced spacing',
        })[v] ?? 'unknown',
      },
    },
    scopes: {
      displayName: {
        label: 'Display Name',
        description: 'The custom name you have given a Guild Wars 2 Account at GW2Auth',
      },
      verificationStatus: {
        label: 'Verification Status',
        description: 'The information whether a Guild Wars 2 Account is verified or not',
      },
      gw2ApiAccess: {
        label: 'Guild Wars 2 API Access',
      },
    },
    sidenav: {
      account: 'Account',
      gw2Accounts: 'GW2 Accounts',
      gw2AccountVerification: 'GW2 Account Verification',
      applications: 'Applications',
      settings: 'Settings',
      developer: 'Developer',
      devApplications: 'Applications',
    },
    errorNotificationContent: {
      status: 'Status',
      requestId: 'Request ID',
    },
    verification: {
      activeChallenge: 'Active Challenge',
      newChallenge: 'New Challenge',
      challenge: 'Challenge',
      itemInfo: 'Item Infos',
      recommended: 'Recommended',
      backToOverview: 'Back to Overview',
      challenges: {
        tokenName: {
          label: 'API Token Name',
          description: 'Create a new API Token using a name provided in the next step',
        },
        tpBuyOrder: {
          label: 'TP Buy-Order',
          description: 'Place a buy-order in the ingame tradingpost. Requires 1-30 Gold. The placed gold can be gained back by dropping the buy-order upon successful verification.',
        },
        characterName: {
          label: 'Character Name',
          description: 'Create a new character using a name provided in the next step. Requires one free character slot. The character can be deleted upon successful verification.',
        },
      },
      wizard: {
        videoGuide: {
          title: 'Video Guide',
          description: 'If you need help, you may follow the Video Guide below',
        },
        enterApiToken: {
          title: 'Enter API Token',
          description: 'Paste the newly generated API Token to submit the verification',
          formFieldName: 'API Token',
          formFieldDescription: 'Paste the API Token here',
        },
        gw2GameLogin: {
          title: 'Login to Guild Wars 2',
          description: 'Login to Guild Wars 2 using the Account you wish to verify',
          content: 'Login to Guild Wars 2 using the Account you wish to verify and follow the next steps',
        },
        placeBuyOrder: {
          title: (name) => `Place a Buy-Order for ${name}`,
          description: () => 'Place the buy-order as stated below to let GW2Auth verify you are the legitimate owner of this Guild Wars 2 Account',
          content: (CopyNameButton, PriceElement) => (
            <>
              <Box>Using the ingame tradingpost, search for</Box>
              <CopyNameButton />

              <Box>And place a buy-order with <Box variant={'strong'}>exactly</Box></Box>
              <PriceElement />
            </>
          ),
          footNode: 'The buy-order can be removed once the verification succeeded',
        },
        createCharacter: {
          title: () => 'Create a verification Character',
          description: () => 'Create a character as stated below to let GW2Auth verify you are the legitimate owner of this Guild Wars 2 Account',
          content: (CopyNameButton) => (
            <>
              <Box>Create a new character using the name</Box>
              <CopyNameButton />
            </>
          ),
          footNode: 'The character can be deleted once the verification succeeded',
        },
        createApiTokenInfo: {
          title: 'Create new API Token - Info',
          description: 'The following steps may be skipped',
          content: (
            <Box>If the Guild Wars 2 Account you performed the previous steps with appears in the list below, <Box variant={'strong'}>you may skip the steps to create a new API Token</Box>.</Box>
          ),
        },
        selectApiToken: {
          formFieldName: 'Existing API Token',
          formFieldDescription: 'Use an existing API Token',
          noneAvailable: 'No existing API Tokens available',
        },
        selectOrEnterApiToken: {
          title: 'Select or enter API Token',
          description: 'Select an existing API Token or paste the newly generated one to submit the verification',
          infoWillOnlyBeUsedForVerification: (
            <Box>The API Token entered here will <Box variant={'strong'}>only be used for the purpose of the verification</Box> and <Box variant={'strong'}>NOT permanently be added to your GW2Auth Account</Box>.</Box>
          ),
        },
        createApiToken: {
          gw2Login: {
            title: 'Login on the GW2 Website',
            description: 'Login on the official website of Guild Wars 2 using the Guild Wars 2 Account you wish to verify',
            content: (XLink) => (
              <Box>Visit the <XLink>Guild Wars 2 Account Page</XLink> and login using the Guild Wars 2 Account you wish to verify.</Box>
            ),
          },
          createToken: {
            title: 'Create a new API Token',
            description: 'Click the button to create a new API Token',
          },
          assignNameAndPermissions: {
            title: 'Assign name and permissions',
            description: 'Assign a name and permissions',
            nameFormFieldName: 'Token Name',
            nameFormFieldDescription: 'Use this exact name for the API Token',
            permissionsFormFieldName: 'Required Permissions',
            permissionsFieldDescription: 'At least these permissions must be granted',
            anyName: 'Choose any name you like',
          },
          copyToken: {
            title: 'Copy the API Token',
            description: 'Click the button shown below to copy your newly created API Token',
          },
        },
        actions: {
          submitInProgress: 'Submitting challenge...',
          succeeded: 'Verification succeeded! Your Guild Wars 2 Account is now verified.',
          inProgress: 'The verification was submitted, but it could not be verified yet. This may happen due to the Guild Wars 2 API not showing the latest data. Please watch the status of this verification on the verification page.',
          failedToSubmit: 'Failed to submit verification challenge',
        },
      },
    },
  },
} as const) satisfies I18nFormats;
