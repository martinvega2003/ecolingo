// Mascota de Ecolingo: el chanchito alcancía del logo (variante A de la
// propuesta visual). Las formas y medidas son las del diseño aprobado; los
// colores salen de los tokens `mascot-*`, `accent`, `gold` y `bronze`.
//
// Props:
// - mood: 'normal' | 'feliz' | 'durmiendo' | 'mareado' (solo cambian los ojos).
// - coin: muestra la moneda entrando por la ranura. Por defecto, solo en 'normal'.
// - title: texto alternativo; sin él la imagen es decorativa (aria-hidden).
import { CoinShapes } from './Coin.jsx';

const Eye = ({ mood }) => {
  if (mood === 'feliz') {
    return (
      <path
        d="M80.4 70.13c3.35-4.19 6.7-4.19 10.05 0"
        fill="none"
        strokeWidth="3.56"
        strokeLinecap="round"
        className="stroke-bg"
      />
    );
  }
  if (mood === 'durmiendo') {
    return (
      <>
        <path
          d="M80.4 68.45c3.35 3.36 6.7 3.36 10.05 0"
          fill="none"
          strokeWidth="3.35"
          strokeLinecap="round"
          className="stroke-bg"
        />
        {/* "z z" del sueño */}
        <path
          d="M95.6 35.67h5.2l-4.7 5.95h5.2M105.9 22.84h3.9l-3.5 4.35h3.6"
          fill="none"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-muted"
        />
      </>
    );
  }
  if (mood === 'mareado') {
    return (
      <path
        d="M82.08 64.68l6.7 6.71M88.78 64.68l-6.7 6.71"
        fill="none"
        strokeWidth="3.35"
        strokeLinecap="round"
        className="stroke-bg"
      />
    );
  }
  return (
    <>
      <circle cx="85.2" cy="68.69" r="4.4" className="fill-bg" />
      <circle cx="86.66" cy="67.23" r="1.47" className="fill-white" />
    </>
  );
};

const VIEW_BOXES = {
  coin: '0 0 120 120',
  durmiendo: '0 16 120 104',
  plain: '0 28 120 92',
};

const Mascot = ({ mood = 'normal', coin, title, className = '' }) => {
  const showCoin = coin ?? mood === 'normal';
  const viewBox = showCoin ? VIEW_BOXES.coin : mood === 'durmiendo' ? VIEW_BOXES.durmiendo : VIEW_BOXES.plain;

  return (
    <svg
      viewBox={viewBox}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {/* cola */}
      <path
        d="M18.19 78.12C9.81 76.72 6.32 72.53 7.71 65.56c1.68-5.03 4.89-6.01 9.64-2.94"
        fill="none"
        strokeWidth="5.03"
        strokeLinecap="round"
        className="stroke-mascot-mid"
      />
      {/* patas */}
      <rect x="29.71" y="94.87" width="16.75" height="20.95" rx="7.33" className="fill-mascot-dark" />
      <rect x="69.49" y="94.87" width="16.76" height="20.95" rx="7.33" className="fill-mascot-dark" />
      {/* cuerpo y panza */}
      <ellipse cx="59.02" cy="80.21" rx="43.98" ry="31.42" className="fill-accent" />
      <ellipse cx="48.55" cy="90.68" rx="25.13" ry="12.57" className="fill-mascot-light" />
      {/* oreja */}
      <path d="M72.64 58.22C71.17 45.66 77.03 35.4 84.99 34.14c5.86 5.44 7.12 16.34 4.61 25.97Z" className="fill-mascot-mid" />
      <path d="M77.03 54.25c-.41-7.54 2.94-12.99 7.13-14.04 2.92 3.56 3.34 9.85 2.09 15.29Z" className="fill-mascot-dark" />
      {/* hocico */}
      <rect x="93.58" y="66.6" width="19.89" height="24.08" rx="9.42" className="fill-mascot-light" />
      <circle cx="100.07" cy="78.54" r="2.41" className="fill-mascot-deep" />
      <circle cx="107.19" cy="78.54" r="2.41" className="fill-mascot-deep" />
      {/* ranura */}
      <rect x="45.41" y="49.22" width="25.13" height="5.86" rx="2.93" className="fill-mascot-deep" />
      <Eye mood={mood} />
      {showCoin && <CoinShapes />}
    </svg>
  );
};

export default Mascot;
