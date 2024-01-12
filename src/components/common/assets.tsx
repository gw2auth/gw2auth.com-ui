import React, { useMemo } from 'react';
import { Gw2ApiPermission } from '../../lib/api/api.model';

export interface AssetProps {
  variant: 'dark' | 'light';
  lang: 'en' | 'de';
}

const responsiveStyle = {
  height: 'auto',
  width: '100%',
} satisfies React.CSSProperties;

export function CreateAPIToken1({ variant, lang }: AssetProps) {
  const href = useMemo(() => `/assets/${lang}/${variant}/create_api_token_01.png`, [variant, lang]);

  if (lang === 'de') {
    return (
      <svg style={responsiveStyle} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1106 661'>
        <image href={href} width='1106' height='661' />

        <Arrow x1={990} y1={475} x2={1000} y2={260} />
        <line x1='750' y1='253' x2='1100' y2='253' stroke='red' strokeWidth='40px' />
        <text x='760' y='260' fontSize='1.5em' fill='black'>Erstelle einen neuen API Schlüssel</text>
      </svg>
    );
  }

  return (
    <svg style={responsiveStyle} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1106 661'>
      <image href={href} width='1106' height='661' />

      <Arrow x1={990} y1={460} x2={1000} y2={260} />
      <line x1='840' y1='253' x2='1090' y2='253' stroke='red' strokeWidth='40px' />
      <text x='850' y='260' fontSize='1.5em' fill='black'>Create a new API Token</text>
    </svg>
  );
}

export interface CreateAPIToken2Props extends AssetProps {
  name: string;
  permissions: ReadonlyArray<Gw2ApiPermission>;
  permissionsText?: React.ReactNode;
}

export function CreateAPIToken2({
  name, variant, lang, permissions, permissionsText,
}: CreateAPIToken2Props) {
  const href = useMemo(() => `/assets/${lang}/${variant}/create_api_token_02_variant1.png`, [variant, lang]);
  const [permissionLines, checkboxes] = useMemo(() => {
    const p: Array<React.ReactNode> = [];
    const c: Array<React.ReactNode> = [];

    for (const perm of permissions) {
      const y = ({
        account: 508,
        inventories: 553,
        characters: 598,
        tradingpost: 642,
        wallet: 688,
        unlocks: 733,
        pvp: 778,
        builds: 823,
        progression: 868,
        guilds: 913,
      })[perm];

      if (y !== undefined) {
        p.push(<line x1='135' y1={y} x2='730' y2='450' stroke='red' strokeWidth='3px' />);
        c.push(<use href='#checkbox' x='125' y={y - 5} />);
      }
    }

    return [p, c];
  }, [permissions]);

  const textBgStroke = useMemo(() => (variant === 'dark' ? 'black' : 'white'), [variant]);

  return (
    <svg style={responsiveStyle} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1106 1105'>
      <defs>
        <image id='checkbox' href='/assets/checkbox.png' width='13' height='13' />
      </defs>

      <image href={href} width='1106' height='1105' />

      <foreignObject x='104' y='458' width='150' height='100%' color='red' fontSize='1.2em'>
        <div style={{ backgroundColor: textBgStroke, padding: '5px' }}>
          <span>{name}</span>
        </div>
      </foreignObject>

      <Arrow x1={140} y1={450} x2={250} y2={350} xCorr={7} yCorr={5} />
      <line x1='195' y1='345' x2='570' y2='345' stroke='red' strokeWidth='40px' />
      <text x='200' y='350' fontSize='1.5em' fill='black'>Assign a name for the new API Token</text>

      {...permissionLines}
      {...checkboxes}
      <foreignObject x='730' y='440' width='350' height='100%' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px', color: 'black' }}>
          {permissionsText ?? <span>Grant required permissions</span>}
        </div>
      </foreignObject>

      <Arrow x1={180} y1={960} x2={800} y2={800} yCorr={10} />
      <line x1='800' y1='800' x2='1015' y2='800' stroke='red' strokeWidth='40px' />
      <text x='805' y='805' fontSize='1.5em' fill='black'>Create the API Token</text>
    </svg>
  );
}

export function CreateAPIToken3({ variant, lang }: AssetProps) {
  const href = useMemo(() => `/assets/${lang}/${variant}/create_api_token_03.png`, [variant, lang]);
  const yAdd = ({
    de: 15,
    en: 0,
  })[lang] ?? 0;

  return (
    <svg style={responsiveStyle} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1106 729'>
      <image href={href} width='1106' height='729' />

      <Arrow x1={985} y1={550 + yAdd} x2={900} y2={360} />
      <foreignObject x='600' y='340' width='400' height='100%' color='black' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px' }}>
          <span>Click this button to copy the newly generated API Token to your clipboard</span>
        </div>
      </foreignObject>
    </svg>
  );
}

export interface TradingpostProps {
  lang: string;
  iconHref: string;
  name: string;
  gold: number;
  silver: number;
  copper: number;
}

export function Tradingpost({
  lang, iconHref, name, gold, silver, copper,
}: TradingpostProps) {
  const href = useMemo(() => `/assets/${lang}/tradingpost.png`, [lang]);
  const goldColor = '#ffcc52';
  const silverColor = '#d0d0d0';
  const copperColor = '#da854b';

  return (
    <svg style={responsiveStyle} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 991 731'>
      <defs>
        <image id='background1' href='/assets/tp_background1.png' width='27' height='18' />
        <image id='background2' href='/assets/tp_background2.png' width='103' height='24' />
        <image id='background3' href='/assets/tp_background3.png' width='174' height='32' />
      </defs>

      <image href={href} width='991' height='731' />
      <image href={iconHref} width='57' height='57' x='272' y='138' />

      <use href='#background1' x='415' y='270' />
      <use href='#background1' x='490' y='270' />
      <use href='#background1' x='565' y='270' />
      <use href='#background2' x='335' y='144' />
      <use href='#background3' x='380' y='310' />

      <text x='335' y='160' fontSize='1.7em' fill='#b222ff'>{name}</text>

      <text x='418' y='286' fontSize='1.2em' fill={goldColor}>{gold}</text>
      <text x='495' y='286' fontSize='1.2em' fill={silverColor}>{silver}</text>
      <text x='570' y='286' fontSize='1.2em' fill={copperColor}>{copper}</text>

      <text x='382' y='333' fontSize='1.5em' fill={goldColor}>{gold}</text>
      <text x='439' y='333' fontSize='1.5em' fill={silverColor}>{silver}</text>
      <text x='497' y='333' fontSize='1.5em' fill={copperColor}>{copper}</text>

      <line x1='425' y1='270' x2='600' y2='200' stroke='red' strokeWidth='3px' />
      <line x1='505' y1='270' x2='600' y2='200' stroke='red' strokeWidth='3px' />
      <line x1='580' y1='270' x2='600' y2='200' stroke='red' strokeWidth='3px' />
      <foreignObject x='560' y='150' width='350' height='100%' color='black' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px' }}>
          <span>Make sure the buy-order <strong>exactly</strong> matches the shown price</span>
        </div>
      </foreignObject>

      <Arrow x1={490} y1={355} x2={750} y2={330} rotate={30} yCorr={13} />
      <foreignObject x='745' y='310' width='210' height='100%' color='black' fontSize='1.5em'>
        <div style={{ backgroundColor: 'red', padding: '5px' }}>
          <span>Place the buy-order</span>
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
