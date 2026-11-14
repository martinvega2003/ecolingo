import { Lock } from 'lucide-react';
import { BADGE_ICONS, FALLBACK_BADGE_ICON } from '../../theme/badgeIcons.js';

// Insignia como medalla redonda (Logros y Resultado): anillo dorado con el
// icono del logro; bloqueada, silueta punteada con candado. El icono sale
// del `code` de la insignia (theme/badgeIcons.js), no del emoji de la API.
const SIZES = {
  md: { box: 'h-16 w-16', icon: 'h-7 w-7', lock: 'h-5 w-5' },
  lg: { box: 'h-20 w-20', icon: 'h-9 w-9', lock: 'h-6 w-6' },
};

const BadgeMedal = ({ code, isUnlocked = true, size = 'md' }) => {
  const Icon = BADGE_ICONS[code] ?? FALLBACK_BADGE_ICON;
  const s = SIZES[size];

  if (!isUnlocked) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted/50 bg-surface-2/50 text-muted ${s.box}`}
      >
        <Lock aria-label="Bloqueada" className={s.lock} />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border-4 border-gold bg-gold/15 text-gold ${s.box}`}
    >
      <Icon aria-hidden="true" className={s.icon} />
    </span>
  );
};

export default BadgeMedal;
