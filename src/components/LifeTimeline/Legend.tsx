import { colors } from '../../config/theme';

/** Key to the line language: still here, branched away, ended, moment. */
export function Legend() {
  const stroke = { stroke: colors.paper, strokeWidth: 1.2 };
  return (
    <ul className="label m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 tracking-[0.1em] text-quiet normal-case">
      <li className="inline-flex items-center gap-2">
        <svg width="28" height="8" aria-hidden="true">
          <line x1="0" y1="4" x2="20" y2="4" {...stroke} />
          <line x1="22" y1="4" x2="28" y2="4" {...stroke} strokeDasharray="2 4" />
        </svg>
        Still here
      </li>
      <li className="inline-flex items-center gap-2">
        <svg width="28" height="8" aria-hidden="true">
          <line x1="0" y1="4" x2="28" y2="4" {...stroke} strokeDasharray="3 5" />
        </svg>
        Branched away
      </li>
      <li className="inline-flex items-center gap-2">
        <svg width="28" height="8" aria-hidden="true">
          <line x1="0" y1="4" x2="22" y2="4" {...stroke} />
          <circle cx="24" cy="4" r="2.6" fill={colors.ink} {...stroke} />
        </svg>
        Ended
      </li>
      <li className="inline-flex items-center gap-2">
        <svg width="12" height="12" aria-hidden="true">
          <rect x="3" y="3" width="6" height="6" transform="rotate(45 6 6)" fill={colors.paper} />
        </svg>
        Moment
      </li>
    </ul>
  );
}
