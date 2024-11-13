import { Box, Link } from '@cloudscape-design/components';
import React from 'react';
import { Issuer } from '../api/api.model';
import {
  ColorScheme, DateFormat, Locale, UIDensity,
} from '../preferences.model';
import { I18nFormats } from './i18n.model';

const CURRENT_YEAR = new Date().getFullYear();
const COMMON = {
  lastUpdated: (time: string) => `Zuletzt aktualisiert: ${time}`,
  issuerName: (issuer: Issuer) => ({
    [Issuer.GITHUB]: 'GitHub',
    [Issuer.GOOGLE]: 'Google',
    [Issuer.COGNITO]: 'E-Mail & Passwort',
    [Issuer.DISCORD]: 'Discord',
  })[issuer] ?? 'unbekannt',
  copyrightGw2: [
    'Diese Seite steht in keiner Verbindung zu ArenaNet, Guild Wars 2 oder einem ihrer Partner. Alle Urheberrechte sind den jeweiligen Eigentümern vorbehalten.',
    '© ArenaNet, LLC. Alle Rechte vorbehalten. NCSOFT, ArenaNet, Guild Wars, Guild Wars 2, GW2, Guild Wars 2, Heart of Thorns, Guild Wars 2: Path of Fire, Guild Wars 2: End of Dragons, und Guild Wars 2: Secrets of the Obscure sowie alle damit in Verbindung stehenden Logos, Designs und kombinierte Zeichen sind Warenzeichen oder eingetragene Warenzeichen der NCSOFT Corporation.',
  ],
} as const;

export const I18N_DE = ({
  locale: Locale.DE,
  general: {
    issuerName: COMMON.issuerName,
    date: (d) => d.toLocaleDateString('de-DE'),
    time: (d) => d.toLocaleTimeString('de-DE'),
    dateTime: (d) => d.toLocaleString('de-DE'),
    failedToLoad: (name) => `${name} konnte nicht geladen werden`,
    externalIconAriaLabel: '(öffnet im neuen Tab)',
    save: 'Speichern',
    cancel: 'Abbrechen',
    loading: 'Lädt',
    submit: 'Absenden',
    none: 'Keine',
    add: 'Hinzufügen',
    continue: 'Fortfahren',
    details: 'Details',
    actions: 'Aktionen',
    view: 'Ansehen',
    delete: 'Löschen',
  },
  gw2: {
    lang: 'de',
    permissionDescription: (v) => ({
      account: 'Anzeigename des Accounts, ID, Heimatwelt und Gilden-Liste',
      builds: 'Aktuell ausgerüstete Spezialisierungen, Eigenschaften, Fertigkeiten und Ausrüstung für alle Spielmodi',
      characters: 'Grundlegende Informationen über Charaktere',
      guilds: 'Mitgliederlisten der Gilden, Verlauf und Nachrichten des Tages für alle Gilden, bei denen du Mitglied bist',
      inventories: 'Account-Bank, Materialienlager, Rezept-Freischaltungen und Charakter-Inventare',
      progression: 'Erfolge, der Freischaltungsstatus von Verliesen, Aufträge für Beherrschungs-Punkte und allgemeiner PvE-Fortschritt',
      pvp: 'PvP-Werte, Match-Verlauf, die Entwicklung des Belohnungspfades und angepasste Arena-Informationen',
      wvw: 'Deine ausgewählte WvW-Gilde, das zugewiesene Team und persönliche WvW-Informationen.',
      tradingpost: 'Transaktionen beim Handelsposten',
      unlocks: 'Garderoben-Freischaltungen – Skins, Farben, Mini Tiergefährten, Todesstöße etc. – und aktuell ausgerüstete Skins',
      wallet: 'Account-Geldbörse',
    })[v] ?? 'unbekannt',
  },
  routes: {
    home: 'Start',
    gw2Accounts: 'GW2 Accounts',
    addGw2Account: { title: 'GW2 Account hinzufügen', breadcrumb: 'Hinzufügen' },
    verification: { title: 'Verifikation', breadcrumb: 'GW2 Account Verifikation' },
    newVerification: { title: 'Neue GW2 Account Verifikation', breadcrumb: 'Neu' },
    pendingVerification: { title: 'Aktive GW2 Account Verifikation', breadcrumb: 'Aktiv' },
    applications: 'Anwendungen',
    settings: 'Einstellungen',
    devApplications: 'Anwendungen',
    createDevApplication: { title: 'Anwendung erstellen', breadcrumb: 'Erstellen' },
    createDevClient: { title: 'Client erstellen', breadcrumb: 'Erstellen' },
    testDevClient: { title: 'Client Test', breadcrumb: 'Test' },
    createDevApiKey: 'API-Key erstellen',
    legal: 'Rechtliches',
    privacyPolicy: 'Datenschutz',
    error: 'Fehler',
  },
  pages: {
    applications: {
      pageHeader: 'Autorisierte Anwendungen',
      tableHeader: 'Anwendungen',
      tableColumns: {
        id: 'ID',
        name: 'Name',
        userId: 'User ID',
        lastUsed: 'Zuletzt verwendet',
        authorizedScopes: 'Autorisierte Berechtigungen',
      },
      never: 'Nie',
      noApplicationsAuthorized: 'Noch keine autorisierten Anwendungen',
    },
    applicationsDetail: {
      entity: 'Autorisierte Anwendung',
      userId: 'User ID',
      lastUsed: 'Zuletzt verwendet',
      authorizedScopes: 'Autorisierte Berechtigungen',
      authorizedGw2Accounts: 'Autorisierte Guild Wars 2 Accounts',
      authorizedGw2AccountsTableColumns: {
        name: 'Name',
        displayName: 'Anzeigename',
      },
      never: 'Nie',
      noGw2AccountsAuthorized: 'Keine GW2 Accounts autorisiert',
      revokeAccess: 'Zugriff widerrufen',
      revokeAccessInProgress: 'Zugriff widerrufen...',
      revokeAccessSuccess: 'Zugriff wurde erfolgreich widerrufen',
      revokeAccessFailed: 'Zugriff konnte nicht widerrufen werden',
      revokeAccessInfo: (
        <Box>Autorisierte Anwendungen können nach dem Entfernen des Zugriffs noch für maximal 30 Minuten einen bereits zuvor ausgestellten API Token verwenden.</Box>
      ),
    },
    gw2Accounts: {
      pageHeader: 'Guild Wars 2 Accounts',
      tableHeader: 'Accounts',
      addApiToken: 'API Token hinzufügen',
      tableColumns: {
        id: 'ID',
        name: 'Name',
        displayName: 'Anzeigename',
        verificationStatus: 'Verifikationsstatus',
        authorizedApplications: 'Autorisierte Anwendungen',
        apiToken: 'API Schlüssel',
        created: 'Erstellt',
      },
      noGw2AccountsAddedYet: 'Noch keine Guild Wars 2 Accounts hinzugefügt',
    },
    gw2AccountsDetail: {
      entity: 'API Schlüssel',
      id: 'ID',
      created: 'Erstellt',
      verificationStatus: 'Verifikationsstatus',
      displayName: {
        label: 'Anzeigename',
        description: 'Ein anpassbarer Name für diesen GW2 Account, kann mit Anwendungen geteilt werden',
      },
      apiToken: {
        label: 'API Schlüssel',
        description: '',
      },
      authorizedApplications: 'Autorisierte Anwendungen',
      authorizedApplicationsTableColumns: {
        name: 'Name',
        lastUsed: 'Zuletzt verwendet',
      },
      formErrors: {
        canNotBeEmpty: 'Kann nicht leer sein',
        canNotBeLongerThan: (maxLen) => `Kann nicht länger als ${maxLen} Zeichen sein`,
      },
      submitErrors: {
        apiTokenInvalid: 'Der API Schlüssel ist ungültig',
        apiTokenForDifferentGw2Account: 'Der API Schlüssel gehört zu einem anderen GW2 Account',
      },
      deleteApiToken: 'API Schlüssel Löschen',
      deleteApiTokenInProgress: 'Lösche API Schlüssel...',
      deleteApiTokenSuccess: 'Dein API Schlüssel wurde gelöscht',
      deleteApiTokenFailed: 'API Schlüssel konnte nicht gelöscht werden',
      deleteApiTokenWarn: (
        <>
          <Box>Das Löschen des API Schlüssel welcher von einer Anwendung verwendet wird <Box variant={'strong'}>wird mit hoher Wahrscheinlichkeit Probleme</Box> mit der Anwendung die diesen verwendet <Box variant={'strong'}>verursachen</Box>.</Box>
          <Box>Solltest du einen neuen API Schlüssel verwenden wollen, <Box variant={'strong'}>füge diesen bitte in dieser UI hinzu</Box> um Probleme zu vermeiden.</Box>
        </>
      ),
      deleteApiTokenInfo: (
        <Box>Autorisierte Anwendungen haben möglicherweise weiterhin für bis zu 30 Minuten Zugriff auf bereits ausgestellte API Schlüssel.</Box>
      ),
      noApplicationsAuthorized: 'Für diesen Guild Wars 2 Account sind keine Anwendungen autorisiert',
      selectApiToken: {
        header: 'API Schlüssel auswählen',
        warning: (
          <>
            <Box>Das Reduzieren der Berechtigungen des API Schlüssel den GW2Auth verwendet <Box variant={'strong'}>kann Probleme</Box> mit Anwendungen die diesen verwenden <Box variant={'strong'}>verursachen</Box>.</Box>
            <Box>GW2Auth teilt niemals den API Schlüssel selbst mit autorisierten Anwendungen. Stattdessen erhalten autorisierte Anwendungen <Link external={true} href={'https://wiki.guildwars2.com/wiki/API:2/createsubtoken'}>subtokens</Link> mit den Berechtigungen die du der Anwendung autorisiert hast.</Box>
            <Box>Es wird empfohlen einen API Schlüssel mit allen Berechtigungen für GW2Auth zu verwenden.</Box>
          </>
        ),
        keepCurrent: {
          label: 'Behalten',
          description: 'Aktuellen API Schlüssel behalten',
        },
        saveNew: {
          label: 'Neu',
          description: 'Neuen API Schlüssel speichern',
        },
      },
    },
    settings: {
      header: 'Einstellungen',
      loginProvidersHeader: 'Login Anbieter',
      sessionsHeader: 'Sessions',
      addLoginProvider: 'Login Anbieter hinzufügen',
      loginProviderName: COMMON.issuerName,
      deleteLoginProviderLoading: 'Login Anbieter wird gelöscht...',
      deleteLoginProviderSuccess: 'Login Anbieter wurde gelöscht!',
      deleteLoginProviderFailed: 'Login Anbieter konnte nicht gelöscht werden',
      deleteSessionLoading: 'Session wird gelöscht...',
      deleteSessionSuccess: 'Session wurde gelöscht!',
      deleteSessionFailed: 'Session konnte nicht gelöscht werden',
      loginProviderTableColumns: {
        issuer: 'Anbieter',
        idAtIssuer: 'ID beim Anbieter',
      },
      sessionTableColumns: {
        current: 'Aktuelle',
        id: 'ID',
        issuer: 'Anbieter',
        idAtIssuer: 'ID beim Anbieter',
        createdAt: 'Erstellt',
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
      tokenVerification: 'Verifizierungs Infos',
      successVerified: 'Dein API Schlüssel wurde erfolgreich hinzugefügt und der Account verizifiert!',
      successNotVerified: 'Dein API Schlüssel wurde erfolgreich hinzugefügt. Die Account-Verifizierung wurde nicht abgeschlossen.',
      failed: 'Beim hinzufügen deines API Schlüssels ist ein Fehler aufgetreten',
      wizard: {
        gw2Login: {
          title: 'Login auf der GW2 Website',
          description: 'Login auf der offiziellen website von Guild Wars 2 mit dem Guild Wars 2 Account den du hinzufügen möchtest',
          content: (Gw2AccountPageLink) => (
            <Box>Besuche die <Gw2AccountPageLink>Guild Wars 2 Account Seite</Gw2AccountPageLink> und logge dich mit dem Guild Wars 2 Account ein den du hinzufügen möchtest.</Box>
          ),
        },
        createToken: {
          title: 'Erstelle einen API Schlüssel',
          description: 'Klicke den Button zum Erstellen eines neuen API Schlüssels',
        },
        assignNameAndPermissions: {
          title: 'Weise einen Namen und Berichtigungen zu',
          description: 'Weise einen Namen und Berichtigungen zu. Wir empfehlen, dem API Schlüssel für GW2Auth alle Berechtigungen zuzuweisen. GW2Auth kümmert sich um die Verwaltung der Berechtigungen von externen Anwendungen.',
          formFieldName: 'Schlüssel Name',
          formFieldDescription: 'Benutze exakt diesen Namen für den API Schlüssel, um gleichzeitig die Account-Verizifierung abzuschließen. Bitte verwende diesen Namen BEIM ERSTELLEN des API Schlüssels. Das Ändern des Namens eines bereits erstellten API Schlüssels ist nicht rechtzeitig über die API sichtbar.',
          anyName: 'Benutze irgendeinen Namen der dir gefällt',
          permissionInfo: (
            <>
              <span>Berechtigungen zuweisen</span>
              <br />
              <span>Wir empfehlen für GW2Auth einen API Schlüssel mit allen Berechtigungen zu benutzen</span>
            </>
          ),
        },
        copyToken: {
          title: 'Kopiere den API Schlüssel',
          description: 'Kopiere den neu erstellten API Schlüssel mithilfe des unten gezeigten Buttons',
        },
        addToken: {
          title: 'Füge den API Schlüssel ein',
          description: 'Füge den neu erstellten API Schlüssel zu deinem GW2Auth Account hinzu',
          formFieldName: 'API Schlüssel',
          formFieldDescription: 'Füge den API Schlüssel hier ein',
        },
      },
    },
    assets: {
      srcBase: '/assets/de',
      gw2Login: {
        anetGw2Account: (
          <>
            <span>ArenaNet GW2 Account?</span>
            <br />
            <span>Login mit E-Mail & Passwort</span>
          </>
        ),
        steamGw2Account: (
          <>
            <span>Steam GW2 Account?</span>
            <br />
            <span>Login mit Steam</span>
          </>
        ),
      },
      createApiToken1: {
        text: 'Erstelle einen neuen API Schlüssel',
      },
      createApiToken2: {
        assignName: 'Weise dem neuen API Schlüssel einen Namen zu',
        assignPermissions: 'Berechtige die erforderlichen Rechte',
        create: 'Erstelle den API Schlüssel',
      },
      createApiToken3: {
        text: 'Kopiere den neu erstellen API Schlüssel mithilfe dieses Buttons',
      },
      tradingpost: {
        makeSureToMatchPrice: <span>Stelle sicher, dass die Buy-Order <strong>exakt</strong> dem angezeigten Preis entspricht</span>,
        placeBuyOrder: 'Platziere die Buy-Order',
      },
    },
    copy: {
      success: 'Kopiert!',
      failed: 'Kopieren fehlgeschlagen',
      inProgress: 'Wird kopiert...',
    },
    confirmationModal: {
      confirmDeletionHeader: (v) => `Bestätige Löschung von ${v}`,
      confirmDeletionShort: () => 'Löschen',
      confirmDeletionLong: (v) => `Bitte bestätige die Löschung diese(r/s) ${v}`,
    },
    hidden: {
      show: 'Aufdecken',
    },
    verificationStatus: {
      verified: {
        label: 'Verifiziert',
        content: (
          <>
            <Box variant={'p'}>Du hast die Verifizierung für diesen Guild Wars 2 Account abgeschlossen.</Box>
            <Box variant={'p'}>GW2Auth wird anderen Nutzern nicht erlauben API Schlüssel von diesem Guild Wars 2 Account hinzuzufügen.</Box>
          </>
        ),
      },
      unverified: {
        label: 'Nicht verifiziert',
        content: (XLink) => (
          <>
            <Box variant={'p'}>Dieser Guild Wars 2 Account wurde noch nicht verifiziert.</Box>
            <Box variant={'p'}>Anwendungen können anfragen den Verifikationsstatus deiner Guild Wars 2 Accounts zu lesen um sicherzustellen, dass du der rechtmäßige Besitzer dieses Guild Wars 2 Account bist.</Box>
            <Box variant={'p'}>Anwendungen könnten verweigern diesen Guild Wars 2 Account zu akzeptieren, solange du ihn nicht verifiziert hast.</Box>
            <Box variant={'p'}>Du hast den Verizierungsprozess auf der <XLink>Verifikationsseite</XLink> starten.</Box>
          </>
        ),
      },
      pending: {
        label: 'Ausstehend',
        content: (XLink) => (
          <>
            <Box variant={'p'}>Du hast den Verifizierungsprozess für diesen Guild Wars 2 Account gestartet, allerdings konnte GW2Auth die Verifizierung noch nicht abschließen.</Box>
            <Box variant={'p'}>Die Guild Wars 2 API gibt keine Echtzeit-Informationen zurück, es kann deshalb einige Minute dauern bis GW2Auth die Verifizierung abschließen kann.</Box>
            <Box variant={'p'}>Du kannst den Status des Verifizierungsprozesses auf der <XLink>Verifikationsseite</XLink> verfolgen.</Box>
          </>
        ),
      },
    },
    contact: {
      ingame: 'Ingame',
      discord: 'Discord',
      discordDetail: (XLink) => (
        <Box>Tritt der <XLink>GW2 Development Community</XLink> im channel <Box variant={'strong'}>#gw2auth</Box> bei</Box>
      ),
      email: 'E-Mail',
      emailDetail: (XLink) => (
        <Box>Sende uns eine E-Mail an <XLink /></Box>
      ),
    },
    cookieBanner: {
      header: 'Cookie Einstellungen',
      content: 'Wir verwenden cookies und local storage um Basisfunktionen auf dieser Seite bereitzustellen, wie zum Beispiel den Login und das Speichern deiner Präferenzen auf diesem Gerät.',
      denyOptional: 'Optionale verweigern',
      customize: 'Anpassen',
      acceptAll: 'Alle akzeptieren',
    },
    cookiePreferences: {
      header: 'Cookie Einstellungen',
      subTitle: 'Wir verwenden Cookies und Local Storage für die folgenden Zwecke',
      denyOptional: 'Optionale verweigern',
      allowed: 'Erlaubt',
      essential: {
        name: 'Benötigt',
        description: 'Benötigte Cookies sind essenziell um unsere Website bereitzustellen und können nicht deaktiviert werden. Sie werden in der Regel in Reaktion deiner Aktionen erzeugt, zum Beispiel um deine Cookie Einstellungen zu speichern, dich auf dieser Website einzuloggen oder durch das Absenden von Formularen.',
      },
      functional: {
        name: 'Funktional',
        description: 'Funktionale Cookies helfen dabei, dir das bestmögliche Erlebnis bereitzustellen. Sie werden unter Anderem benötigt, um deine Einstellungen (Sprache, Zeit/Datumsformat, etc) zu speichern.',
      },
      learnMore: (XLink) => (
        <Box variant={'small'}>Weitere Informationen findest du unter <XLink>Datenschutz</XLink>.</Box>
      ),
    },
    devAppApprovalType: {
      _public: {
        label: 'Öffentlich',
        detail: 'Benutzer werden erhalten automatisch eine Zustimmung während deren erstem Login',
      },
      required: {
        label: 'Mit Zustimmung',
        detail: 'Benutzer müssen von dir bestätigt werden, bevor sie diesen Client verwenden können',
      },
    },
    devAppRedirectURIs: {
      additionalInfo: 'Du kannst die folgende URI verwenden, um diesen Client auf auf dieser Website zu testen: ',
    },
    footer: {
      legal: 'Rechtliches',
      privacyPolicy: 'Datenschutz',
      faq: 'Häufig gestellte Fragen',
      developerWiki: 'Entwickler Wiki',
      cookiePreferences: 'Cookie Einstellungen',
      copyrightGw2Auth: `© ${CURRENT_YEAR} Felix.9127`,
      copyrightGw2: COMMON.copyrightGw2,
    },
    header: {
      github: 'GitHub',
      preferences: 'Einstellungen',
      login: 'Login',
      logout: 'Logout',
      account: 'Account',
      accountDescription: (authInfo, dateFormat) => `Eingeloggt mit ${COMMON.issuerName(authInfo.issuer)} seit ${dateFormat(authInfo.sessionCreationTime)}`,
    },
    login: {
      loginWith: (v) => `Login mit ${COMMON.issuerName(v)}`,
      noPreviousWarning: (
        <>
          <Box>Falls du dich in der Vergangenheit schon einmal bei GW2Auth eingeloggt hast, <Box variant={'strong'}>verwende bitte den gleichen Logindienst den du zuvor verwendet hast</Box>.</Box>
          <Box>Solltest du GW2Auth noch nie verwendet haben, verwende den Logindienst der dir am meisten zusagt.</Box>
        </>
      ),
      previousWarning: (v) => (
        <>
          <Box>Du hast dich bei GW2Auth zuvor mit <Box variant={'strong'}>{COMMON.issuerName(v)}</Box> eingeloggt.</Box>
          <Box>Solltest du dich mit einem Logindienst einloggen der noch nicht mit deinem GW2Auth Account verlinkt ist, erstellst du damit einen neuen GW2Auth Account.</Box>
          <Box>Falls du einen neuen Logindienst zu deinem GW2Auth Account hinzufügen möchtest, logge dich bitte zunächst mit dem bereits verwendeten Logindienst ein und füge einen weiteren Logindienst über deine Account-Einstellungen hinzu.</Box>
        </>
      ),
      moreOptions: 'Weitere Optionen',
    },
    preferences: {
      header: 'Einstellungen',
      functionalCookieWarning: (
        <Box>Du hast in den Cookie Einstellungen keine Zustimmung für <Box variant={'strong'}>funktionale Cookies</Box> gegeben. Änderungen in diesem Dialog gehen <Box variant={'strong'}>beim neuladen der Seite verloren</Box>.</Box>
      ),
      locale: {
        category: 'Sprache',
        name: (v) => ({
          [Locale.SYSTEM]: 'System',
          [Locale.EN]: 'English',
          [Locale.DE]: 'Deutsch',
        })[v] ?? 'unbekannt',
      },
      dateAndTime: {
        category: 'Zeit- und Datumsformat',
        name: (v) => ({
          [DateFormat.SYSTEM]: 'System',
          [DateFormat.LOCALE]: 'Sprache',
          [DateFormat.ISO_8601]: 'ISO',
        })[v] ?? 'unbekannt',
      },
      theme: {
        category: 'Aussehen',
        name: (v) => ({
          [ColorScheme.SYSTEM]: 'System',
          [ColorScheme.LIGHT]: 'Hell',
          [ColorScheme.DARK]: 'Dunkel',
        })[v] ?? 'unbekannt',
        description: (v: ColorScheme) => ({
          [ColorScheme.SYSTEM]: 'Verwendet das von deinem System vorgegebene Aussehen',
          [ColorScheme.LIGHT]: 'Klassisch helle UI',
          [ColorScheme.DARK]: 'Klassisch dunkle UI',
        })[v] ?? 'unbekannt',
      },
      density: {
        category: 'Abstand',
        name: (v) => ({
          [UIDensity.COMFORTABLE]: 'Standard',
          [UIDensity.COMPACT]: 'Reduziert',
        })[v] ?? 'unbekannt',
        description: (v) => ({
          [UIDensity.COMFORTABLE]: 'Standard Abstand zwischen Elementen',
          [UIDensity.COMPACT]: 'Reduzierter Abstand zwischen Elementen',
        })[v] ?? 'unbekannt',
      },
    },
    scopes: {
      displayName: {
        label: 'Anzeigename',
        description: 'Der Name den du deinen Guild Wars 2 Accounts bei GW2Auth zugewiesen hast',
      },
      verificationStatus: {
        label: 'Verifikationsstatus',
        description: 'Die Information ob deine Guild Wars 2 Accounts auf GW2Auth verifiziert sind oder nicht',
      },
      gw2ApiAccess: {
        label: 'Guild Wars 2 API Zugriff',
      },
    },
    sidenav: {
      account: 'Account',
      gw2Accounts: 'GW2 Accounts',
      gw2AccountVerification: 'GW2 Account Verifikation',
      applications: 'Anwendungen',
      settings: 'Einstellungen',
      developer: 'Entwickler',
      devApplications: 'Anwendungen',
    },
    errorNotificationContent: {
      status: 'Status',
      requestId: 'Request ID',
    },
    verification: {
      activeChallenge: 'Aktive Challenge',
      newChallenge: 'Neue Challenge',
      challenge: 'Challenge',
      itemInfo: 'Item Informationen',
      recommended: 'Empfohlen',
      backToOverview: 'Zurück zur Übersicht',
      challenges: {
        tokenName: {
          label: 'API Schlüssel Name',
          description: 'Erstelle einen neuen API Schlüssel mit einem Namen der im nächsten Schritt generiert wird',
        },
        tpBuyOrder: {
          label: 'Handelsposten Buy-Order',
          description: 'Platziere eine Buy-Order im Ingame-Handelsposten. Erfordert 1-30 Gold. Das platzierte Gold kannst du dir aus dem Handelsposten zurückholen, sobald die Verifizierung abgeschlossen ist.',
        },
        characterName: {
          label: 'Charakter Name',
          description: 'Erstelle einen neuen Charakter mit einem Namen der im nächsten Schritt generiert wird. Der Charakter kann nach abgeschlossener Verifizierung wieder gelöscht werden.',
        },
      },
      wizard: {
        videoGuide: {
          title: 'Video Guide',
          description: 'Solltest du Hilfe benötigen, kannst du dem unten gezeigten Video Guide folgen',
        },
        enterApiToken: {
          title: 'API Schlüssel hinzufügen',
          description: 'Füge den neu erstellen API Schlüssel ein, um den Verifikationsprozess abzusenden',
          formFieldName: 'API Schlüssel',
          formFieldDescription: 'Füge den API Schlüssel hier ein',
        },
        gw2GameLogin: {
          title: 'Login bei Guild Wars 2',
          description: 'Logge dich bei Guild Wars 2 (Spielclient) mit dem Guild Wars 2 Account ein, den du verifizieren möchtest',
          content: 'Logge dich mit dem Guild Wars 2 Account ins Spiel ein, den du verifizieren möchtest und befolge die nachfolgenden Schritte.',
        },
        placeBuyOrder: {
          title: (name) => `Platziere eine Buy-Order für ${name}`,
          description: () => 'Platziere eine Buy-Order wie unten beschrieben, um zu beweisen, dass du der rechtmäßige Besitzer dieses Guild Wars 2 Accounts bist',
          content: (CopyNameButton, PriceElement) => (
            <>
              <Box>Mithilfe des Ingame Handelsposten, suche nach</Box>
              <CopyNameButton />

              <Box>Und platziere eine Buy-Order mit <Box variant={'strong'}>exakt</Box></Box>
              <PriceElement />
            </>
          ),
          footNode: 'Die Buy-Order kann entfernt werden sobald die Verifikation abgeschlossen ist',
        },
        createCharacter: {
          title: () => 'Erstelle einen Charakter zur Verifizierung',
          description: () => 'Erstelle einen neuen Charakter wie unten beschrieben, um zu beweisen, dass du der rechtmäßige Besitzer dieses Guild Wars 2 Accounts bist',
          content: (CopyNameButton) => (
            <>
              <Box>Erstelle einen neuen Charakter mit dem Namen</Box>
              <CopyNameButton />
            </>
          ),
          footNode: 'Der Charakter kann gelöscht werden sobald die Verfikation abgeschlossen ist',
        },
        createApiTokenInfo: {
          title: 'Erstelle einen API Schlüssel - Info',
          description: 'Die folgenden Schritte können ggf. übersprungen werden',
          content: (
            <Box>Falls der Guild Wars 2 Account mit dem du die vorherigen Schritte ausgeführt hast hier auftaucht, <Box variant={'strong'}>kannst du ihn hier auswählen und damit die restlichen Schritte überspringen</Box>.</Box>
          ),
        },
        selectApiToken: {
          formFieldName: 'Vorhandener API Schlüssel',
          formFieldDescription: 'Verwende einen vorhandenen API Schlüssel',
          noneAvailable: 'Keine vorhandenen API Schlüssel verfügbar',
        },
        selectOrEnterApiToken: {
          title: 'API Schlüssel auswählen oder hinzufügen',
          description: 'Wähle einen vorhandenen API Schlüssel aus oder füge einen neu erstellten ein, um den Verifikationsprozess abzusenden',
          infoWillOnlyBeUsedForVerification: (
            <Box>Der hier hinzugefügte API Schlüssel wird <Box variant={'strong'}>nur für den Verifikationsprozess verwendet</Box> und <Box variant={'strong'}>nicht dauerhaft zu deinem GW2Auth Account hinzugefügt</Box>.</Box>
          ),
        },
        createApiToken: {
          gw2Login: {
            title: 'Login auf der GW2 Website',
            description: 'Login auf der offiziellen website von Guild Wars 2 mit dem Guild Wars 2 Account den du verifizieren möchtest',
            content: (XLink) => (
              <Box>Besuche die <XLink>Guild Wars 2 Account Seite</XLink> und logge dich mit dem Guild Wars 2 Account ein den du verifizieren möchtest.</Box>
            ),
          },
          createToken: {
            title: 'Erstelle einen API Schlüssel',
            description: 'Klicke den Button zum Erstellen eines neuen API Schlüssels',
          },
          assignNameAndPermissions: {
            title: 'Weise einen Namen und Berichtigungen zu',
            description: 'Weise einen Namen und Berichtigungen zu',
            nameFormFieldName: 'Schlüssel Name',
            nameFormFieldDescription: 'Benutze exakt diesen Namen für den API Schlüssel',
            permissionsFormFieldName: 'Erforderliche Berechtigungen',
            permissionsFieldDescription: 'Für die ausgewählte Verifikationsmethode müssen mindestens diese Berechtigungen zugewiesen werden',
            anyName: 'Benutze irgendeinen Namen der dir gefällt',
          },
          copyToken: {
            title: 'Kopiere den API Schlüssel',
            description: 'Kopiere den neu erstellten API Schlüssel mithilfe des unten gezeigten Buttons',
          },
        },
        actions: {
          submitInProgress: 'Challenge wird abgesendet...',
          succeeded: 'Verifikation erfolgreich! Dein Guild Wars 2 Account ist jetzt verifiziert.',
          inProgress: 'Der Verifikationsprozess wurde gestartet, allerdings konnte die Verifizierung noch nicht abgeschlossen werden. Die Guild Wars 2 API gibt keine Echtzeit-Informationen zurück, es kann deshalb einige Minute dauern bis GW2Auth die Verifizierung abschließen kann.',
          failedToSubmit: 'Der Verifikationsprozess konnte nicht gestartet werden',
        },
      },
    },
  },
} as const) satisfies I18nFormats;
