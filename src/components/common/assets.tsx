import React, { useMemo } from 'react';
import { Gw2ApiPermission } from '../../lib/api/api.model';
import { Locale } from '../../lib/preferences.model';
import { useI18n } from '../util/context/i18n';

export interface AssetProps {
  variant: 'dark' | 'light';
}

function responsiveStyle(width: number): React.CSSProperties {
  return {
    height: 'auto',
    width: '100%',
    maxWidth: `${width * 1.2}px`,
  };
}

export function Gw2Login() {
  const i18n = useI18n();
  const href = useMemo(() => `${i18n.components.assets.srcBase}/login.png`, [i18n]);

  return (
    <svg style={responsiveStyle(500)} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 661'>
      <image href={href} width='500' height='661' />

      <Arrow x1={90} y1={260} x2={70} y2={100} rotate={-70} xCorr={10} yCorr={10} />
      <foreignObject x='10' y='70' width='230' height='100%' color='black' fontSize='1.2em'>
        <div style={{ backgroundColor: 'red', padding: '5px' }}>
          {i18n.components.assets.gw2Login.anetGw2Account}
        </div>
      </foreignObject>

      <Arrow x1={240} y1={429} x2={330} y2={260} xCorr={4} />
      <foreignObject x='290' y='230' width='180' height='100%' color='black' fontSize='1.2em'>
        <div style={{ backgroundColor: 'red', padding: '5px' }}>
          {i18n.components.assets.gw2Login.steamGw2Account}
        </div>
      </foreignObject>
    </svg>
  );
}

export function CreateAPIToken1({ variant }: AssetProps) {
  const i18n = useI18n();
  const href = useMemo(() => `${i18n.components.assets.srcBase}/${variant}/create_api_token_01.png`, [i18n, variant]);

  if (i18n.locale === Locale.DE) {
    return (
      <svg style={responsiveStyle(1106)} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1106 661'>
        <image href={href} width='1106' height='661' />

        <Arrow x1={990} y1={475} x2={1000} y2={260} />
        <foreignObject x='750' y='230' width='350' height='100%' color='black' fontSize='1.5em'>
          <div style={{ backgroundColor: 'red', padding: '5px' }}>
            <span>{i18n.components.assets.createApiToken1.text}</span>
          </div>
        </foreignObject>
      </svg>
    );
  }

  return (
    <svg style={responsiveStyle(1106)} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1106 661'>
      <image href={href} width='1106' height='661' />

      <Arrow x1={990} y1={460} x2={1000} y2={260} />
      <foreignObject x='820' y='230' width='280' height='100%' color='black' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px' }}>
          <span>{i18n.components.assets.createApiToken1.text}</span>
        </div>
      </foreignObject>
    </svg>
  );
}

export interface CreateAPIToken2Props extends AssetProps {
  name: string;
  permissions: ReadonlyArray<Gw2ApiPermission>;
  permissionsText?: React.ReactNode;
}

export function CreateAPIToken2({
  name, variant, permissions, permissionsText,
}: CreateAPIToken2Props) {
  const i18n = useI18n();
  const href = useMemo(() => `${i18n.components.assets.srcBase}/${variant}/create_api_token_02_variant1.png`, [i18n, variant]);
  const [permissionLines, checkboxes] = useMemo(() => {
    const p: Array<React.ReactNode> = [];
    const c: Array<React.ReactNode> = [];

    for (const perm of permissions) {
      const y = ({
        account: 458,
        inventories: 503,
        characters: 548,
        tradingpost: 592,
        wallet: 638,
        unlocks: 683,
        pvp: 728,
        builds: 773,
        progression: 818,
        guilds: 863,
      })[perm];

      if (y !== undefined) {
        p.push(<line x1='135' y1={y} x2='730' y2='400' stroke='red' strokeWidth='3px' />);
        c.push(<use href='#checkbox' x='125' y={y - 5} />);
      }
    }

    return [p, c];
  }, [permissions]);

  const textBgStroke = useMemo(() => (variant === 'dark' ? 'black' : 'white'), [variant]);

  return (
    <svg style={responsiveStyle(1106)} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1106 1005'>
      <defs>
        <image id='checkbox' href='/assets/checkbox.png' width='13' height='13' />
      </defs>

      <image href={href} width='1106' height='1005' />

      <foreignObject x='104' y='408' width='800' height='100%' color='red' fontSize='1.2em'>
        <div style={{ backgroundColor: textBgStroke, padding: '5px' }}>
          <span>{name}</span>
        </div>
      </foreignObject>

      <Arrow x1={140} y1={400} x2={250} y2={300} xCorr={7} yCorr={5} />
      <foreignObject x='245' y='280' width='350' height='100%' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px', color: 'black' }}>
          <span>{i18n.components.assets.createApiToken2.assignName}</span>
        </div>
      </foreignObject>

      {...permissionLines}
      {...checkboxes}
      <foreignObject x='730' y='390' width='350' height='100%' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px', color: 'black' }}>
          {permissionsText ?? <span>{i18n.components.assets.createApiToken2.assignPermissions}</span>}
        </div>
      </foreignObject>

      <Arrow x1={180} y1={910} x2={800} y2={750} yCorr={10} />
      <foreignObject x='795' y='745' width='300' height='100%' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px', color: 'black' }}>
          <span>{i18n.components.assets.createApiToken2.create}</span>
        </div>
      </foreignObject>
    </svg>
  );
}

export function CreateAPIToken3({ variant }: AssetProps) {
  const i18n = useI18n();
  const href = useMemo(() => `${i18n.components.assets.srcBase}/${variant}/create_api_token_03.png`, [i18n, variant]);
  const yAdd = ({
    [Locale.DE]: 15,
    [Locale.EN]: 0,
  })[i18n.locale] ?? 0;

  return (
    <svg style={responsiveStyle(1006)} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1106 729'>
      <image href={href} width='1106' height='729' />

      <Arrow x1={985} y1={550 + yAdd} x2={900} y2={360} />
      <foreignObject x='600' y='340' width='400' height='100%' color='black' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px' }}>
          <span>{i18n.components.assets.createApiToken3.text}</span>
        </div>
      </foreignObject>
    </svg>
  );
}

export interface TradingpostProps {
  iconHref: string;
  name: string;
  gold: number;
  silver: number;
  copper: number;
}

export function Tradingpost({
  iconHref, name, gold, silver, copper,
}: TradingpostProps) {
  const i18n = useI18n();
  const href = useMemo(() => `${i18n.components.assets.srcBase}/tradingpost.png`, [i18n]);
  const goldColor = '#ffcc52';
  const silverColor = '#d0d0d0';
  const copperColor = '#da854b';

  return (
    <svg style={responsiveStyle(991)} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 991 731'>
      <image href={href} width='991' height='731' />
      <image href={iconHref} width='57' height='57' x='272' y='138' />

      <text x='335' y='160' fontSize='1.7em' fill='#b222ff'>{name}</text>

      <text x='418' y='286' fontSize='1.2em' fill={goldColor}>{gold}</text>
      <text x='495' y='286' fontSize='1.2em' fill={silverColor}>{silver}</text>
      <text x='570' y='286' fontSize='1.2em' fill={copperColor}>{copper}</text>

      <text x='384' y='332' fontSize='1.5em' fill={goldColor}>{gold}</text>
      <text x='439' y='332' fontSize='1.5em' fill={silverColor}>{silver}</text>
      <text x='497' y='332' fontSize='1.5em' fill={copperColor}>{copper}</text>

      <line x1='425' y1='270' x2='600' y2='200' stroke='red' strokeWidth='3px' />
      <line x1='505' y1='270' x2='600' y2='200' stroke='red' strokeWidth='3px' />
      <line x1='580' y1='270' x2='600' y2='200' stroke='red' strokeWidth='3px' />
      <foreignObject x='560' y='150' width='350' height='100%' color='black' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px' }}>
          {i18n.components.assets.tradingpost.makeSureToMatchPrice}
        </div>
      </foreignObject>

      <Arrow x1={490} y1={355} x2={750} y2={330} rotate={30} yCorr={13} />
      <foreignObject x='745' y='310' width='210' height='100%' color='black' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px' }}>
          <span>{i18n.components.assets.tradingpost.placeBuyOrder}</span>
        </div>
      </foreignObject>
    </svg>
  );
}

function Arrow({
  x1, y1, x2, y2, xCorr, yCorr, rotate,
}: { x1: number, y1: number, x2: number, y2: number, xCorr?: number, yCorr?: number, rotate?: number }) {
  const xxCorr = xCorr ?? 0;
  const yyCorr = yCorr ?? 0;

  const points = [
    [x1 + 15 + xxCorr, y1 - 15 + yyCorr],
    [x1 - 15 + xxCorr, y1 - 15 + yyCorr],
    [x1 + xxCorr, y1 + 5 + yyCorr],
  ].map((v) => v.join(',')).join(' ');

  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke='red' strokeWidth='7px' />
      <polygon points={points} fill='red' stroke='red' transform={rotate !== undefined ? `rotate(${rotate} ${x1} ${y1})` : undefined} />
    </>
  );
}
