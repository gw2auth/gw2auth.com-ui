import { I18nProviderProps } from '@cloudscape-design/components/i18n';
import { AuthInfo, Gw2ApiPermission, Issuer } from '../api/api.model';
import { EffectiveLocale, Locale } from '../preferences.model';

const CURRENT_YEAR = new Date().getFullYear();

export interface I18nFormats {
  loading: string;
  externalIconAriaLabel: string;
  account: string;
  developer: string;
  login: string;
  logout: string;
  issuerName: (issuer: Issuer) => string,
  date: (date: Date) => string,
  time: (date: Date) => string,
  dateTime: (date: Date) => string,
  header: {
    accountDescription: (authInfo: AuthInfo) => string,
    preferences: string;
    preferencesLocale: string;
    preferencesLocaleSystem: string;
    preferencesLocaleEN: string;
    preferencesLocaleDE: string;
    preferencesTheme: string;
    preferencesThemeSystem: string;
    preferencesThemeLight: string;
    preferencesThemeDark: string;
    preferencesDensity: string;
    preferencesDensityComfortable: string;
    preferencesDensityCompact: string;
  };
  footer: {
    legal: string;
    privacyPolicy: string;
    faq: string;
    developerWiki: string;
    cookiePreferences: string;
    copyrightGw2Auth: string;
    copyrightGw2: Array<string>;
  };
  legal: {
    lastUpdated: string;
  };
  gw2ApiPermissionDescription: (permission: Gw2ApiPermission) => string;
}

export type I18n = Record<EffectiveLocale, I18nFormats>;

const ISSUER_NAMES = {
  [Locale.EN]: {
    [Issuer.GITHUB]: 'GitHub',
    [Issuer.GOOGLE]: 'Google',
    [Issuer.COGNITO]: 'E-Mail & Password',
  },
  [Locale.DE]: {
    [Issuer.GITHUB]: 'GitHub',
    [Issuer.GOOGLE]: 'Google',
    [Issuer.COGNITO]: 'E-Mail & Passwort',
  },
};

function issuerName(locale: EffectiveLocale, issuer: Issuer): string {
  return ISSUER_NAMES[locale][issuer] ?? issuer;
}

export const I18N_GW2AUTH: I18n = {
  [Locale.EN]: {
    loading: 'Loading',
    externalIconAriaLabel: '(opens in a new tab)',
    account: 'Account',
    developer: 'Developer',
    login: 'Login',
    logout: 'Logout',
    issuerName: issuerName.bind(this, Locale.EN),
    date: (v) => v.toLocaleDateString('en-US'),
    time: (v) => v.toLocaleTimeString('en-US'),
    dateTime: (v) => v.toLocaleString('en-US'),
    header: {
      accountDescription: (authInfo) => `Signed in using ${issuerName(Locale.EN, authInfo.issuer)} since ${new Date(authInfo.sessionCreationTime).toLocaleString('en-US')}`,
      preferences: 'Preferences',
      preferencesLocale: 'Locale',
      preferencesLocaleSystem: 'System',
      preferencesLocaleEN: 'English',
      preferencesLocaleDE: 'Deutsch',
      preferencesTheme: 'Theme',
      preferencesThemeSystem: 'System',
      preferencesThemeLight: 'Light',
      preferencesThemeDark: 'Dark',
      preferencesDensity: 'Density',
      preferencesDensityComfortable: 'Comfortable',
      preferencesDensityCompact: 'Compact',
    },
    footer: {
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
      faq: 'FAQ',
      developerWiki: 'Developer Wiki',
      cookiePreferences: 'Cookie preferences',
      copyrightGw2Auth: `© ${CURRENT_YEAR} Felix.9127`,
      copyrightGw2: [
        'This site is not affiliated with ArenaNet, Guild Wars 2, or any of their partners. All copyrights reserved to their respective owners.',
        '© ArenaNet LLC. All rights reserved. NCSOFT, ArenaNet, Guild Wars, Guild Wars 2, GW2, Guild Wars 2: Heart of Thorns, Guild Wars 2: Path of Fire, Guild Wars 2: End of Dragons, and Guild Wars 2: Secrets of the Obscure and all associated logos, designs, and composite marks are trademarks or registered trademarks of NCSOFT Corporation.',
      ],
    },
    legal: {
      lastUpdated: 'Last updated',
    },
    gw2ApiPermissionDescription: (permission) => ({
      account: 'Your account display name, ID, home world, and list of guilds',
      builds: 'Your currently equipped specializations, traits, skills, and equipment for all game modes',
      characters: 'Basic information about your characters',
      guilds: 'Guilds\' rosters, history, and MOTDs for all guilds you are a member of',
      inventories: 'Your account bank, material storage, recipe unlocks, and character inventories',
      progression: 'Your achievements, dungeon unlock status, mastery point assignments, and general PvE progress',
      pvp: 'Your PvP stats, match history, reward track progression, and custom arena details',
      tradingpost: 'Your Trading Post transactions',
      unlocks: 'Your wardrobe unlocks—skins, dyes, minipets, finishers, etc.—and currently equipped skins',
      wallet: 'Your account\'s wallet',
    })[permission] ?? 'unknown',
  },
  [Locale.DE]: {
    loading: 'Lädt',
    externalIconAriaLabel: '(öffnet im neuen Tab)',
    account: 'Account',
    developer: 'Entwickler',
    login: 'Einloggen',
    logout: 'Ausloggen',
    issuerName: issuerName.bind(this, Locale.DE),
    date: (v) => v.toLocaleDateString('de-DE'),
    time: (v) => v.toLocaleTimeString('de-DE'),
    dateTime: (v) => v.toLocaleString('de-DE'),
    header: {
      accountDescription: (authInfo) => `Eingeloggt mit ${issuerName(Locale.DE, authInfo.issuer)} seit ${new Date(authInfo.sessionCreationTime).toLocaleString('de-DE')}`,
      preferences: 'Einstellungen',
      preferencesLocale: 'Sprache',
      preferencesLocaleSystem: 'Standard',
      preferencesLocaleEN: 'English',
      preferencesLocaleDE: 'Deutsch',
      preferencesTheme: 'Aussehen',
      preferencesThemeSystem: 'Standard',
      preferencesThemeLight: 'Hell',
      preferencesThemeDark: 'Dunkel',
      preferencesDensity: 'UI Dichte',
      preferencesDensityComfortable: 'Komfortabel',
      preferencesDensityCompact: 'Kompakt',
    },
    footer: {
      legal: 'Legal',
      privacyPolicy: 'Datenschutz',
      faq: 'Häufig gestellte Fragen',
      developerWiki: 'Entwickler Wiki',
      cookiePreferences: 'Cookie Einstellungen',
      copyrightGw2Auth: `© ${CURRENT_YEAR} Felix.9127`,
      copyrightGw2: [
        'Diese Seite steht in keiner Verbindung zu ArenaNet, Guild Wars 2 oder einem ihrer Partner. Alle Urheberrechte sind den jeweiligen Eigentümern vorbehalten.',
        '© ArenaNet, LLC. Alle Rechte vorbehalten. NCSOFT, ArenaNet, Guild Wars, Guild Wars 2, GW2, Guild Wars 2, Heart of Thorns, Guild Wars 2: Path of Fire, Guild Wars 2: End of Dragons, und Guild Wars 2: Secrets of the Obscure sowie alle damit in Verbindung stehenden Logos, Designs und kombinierte Zeichen sind Warenzeichen oder eingetragene Warenzeichen der NCSOFT Corporation.',
      ],
    },
    legal: {
      lastUpdated: 'Zuletzt aktualisiert',
    },
    gw2ApiPermissionDescription: (permission) => ({
      account: 'Anzeigename des Accounts, ID, Heimatwelt und Gilden-Liste',
      builds: 'Aktuell ausgerüstete Spezialisierungen, Eigenschaften, Fertigkeiten und Ausrüstung für alle Spielmodi',
      characters: 'Grundlegende Informationen über Charaktere',
      guilds: 'Mitgliederlisten der Gilden, Verlauf und Nachrichten des Tages für alle Gilden, bei denen du Mitglied bist',
      inventories: 'Account-Bank, Materialienlager, Rezept-Freischaltungen und Charakter-Inventare',
      progression: 'Erfolge, der Freischaltungsstatus von Verliesen, Aufträge für Beherrschungs-Punkte und allgemeiner PvE-Fortschritt',
      pvp: 'PvP-Werte, Match-Verlauf, die Entwicklung des Belohnungspfades und angepasste Arena-Informationen',
      tradingpost: 'Transaktionen beim Handelsposten',
      unlocks: 'Garderoben-Freischaltungen – Skins, Farben, Mini Tiergefährten, Todesstöße etc. – und aktuell ausgerüstete Skins',
      wallet: 'Account-Geldbörse',
    })[permission] ?? 'unknown',
  },
};

export const customI18nMessages: I18nProviderProps.Messages = {
  '@cloudscape-design/components': {
    en: {},
    de: {},
  },
};
