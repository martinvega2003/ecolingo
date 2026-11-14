// Moneda con el símbolo ₲ (guaraní). Mismos trazos que la moneda del logo:
// el símbolo es un path, no texto, así que no depende de ninguna fuente.
// Decorativa: se usa flotando en el login, en el saludo del Mapa y en la
// lluvia de monedas del Resultado.
export const GUARANI_PATH =
  'M57.79 33.61h1.22V31.8c3.49-.31 5.92-2.66 5.92-6.46v-2H59.01v-3.89c1.1.21 1.83.9 2.11 1.93h3.64c-.34-2.78-2.66-4.81-5.75-5.11v-1.82h-1.22v1.78c-3.86.19-6.84 3.02-6.84 7.83 0 4.63 2.74 7.56 6.84 7.76Zm0-4.96c-2-.23-3.16-1.9-3.16-4.64 0-2.73 1.21-4.37 3.16-4.6Zm1.22-.03v-2.63h2.44c-.03 1.42-.9 2.41-2.44 2.63Z';

export const CoinShapes = () => (
  <>
    <circle cx="57.98" cy="23.67" r="17.1" className="fill-gold stroke-bronze" strokeWidth="3.18" />
    <path d={GUARANI_PATH} fillRule="evenodd" className="fill-mascot-coin" />
  </>
);

const Coin = ({ className = '' }) => (
  <svg viewBox="38.98 4.67 38 38" aria-hidden="true" className={className}>
    <CoinShapes />
  </svg>
);

export default Coin;
