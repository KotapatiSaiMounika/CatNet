/* Decorative sticker SVGs used as subtle ambient accents.
   All instances are pointer-events-none, aria-hidden, low opacity. */

type S = { className?: string };

export function SleepingKitten({ className = "" }: S) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      {/* body curl */}
      <path
        d="M20 55 Q15 30 45 25 Q80 20 95 40 Q108 55 90 62 Q60 70 30 65 Z"
        fill="#FFD6BA"
      />
      {/* ear */}
      <path d="M40 30 L46 16 L54 30 Z" fill="#FFD6BA" />
      <path d="M55 28 L62 18 L68 30 Z" fill="#FFD6BA" />
      {/* tail */}
      <path
        d="M88 55 Q110 50 100 35"
        stroke="#FFD6BA"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
      {/* closed eye */}
      <path
        d="M48 42 Q52 46 56 42"
        stroke="#3B3B3B"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      {/* zZz */}
      <text
        x="78"
        y="22"
        fontFamily="serif"
        fontSize="12"
        fill="#D8C7FF"
        fontStyle="italic"
      >
        z
      </text>
      <text x="86" y="14" fontFamily="serif" fontSize="9" fill="#D8C7FF" fontStyle="italic">
        z
      </text>
    </svg>
  );
}

export function PeekingCat({ className = "" }: S) {
  return (
    <svg viewBox="0 0 80 60" className={className} aria-hidden>
      {/* ears */}
      <path d="M14 30 L20 14 L28 30 Z" fill="#F9C5D5" />
      <path d="M52 30 L60 14 L66 30 Z" fill="#F9C5D5" />
      {/* head peeking from bottom */}
      <ellipse cx="40" cy="50" rx="32" ry="22" fill="#F9C5D5" />
      {/* eyes */}
      <ellipse cx="30" cy="44" rx="2" ry="3" fill="#3B3B3B" />
      <ellipse cx="50" cy="44" rx="2" ry="3" fill="#3B3B3B" />
      {/* blush */}
      <circle cx="22" cy="50" r="3" fill="#FFB4C5" opacity="0.7" />
      <circle cx="58" cy="50" r="3" fill="#FFB4C5" opacity="0.7" />
      {/* nose */}
      <path d="M38 50 L40 52 L42 50 Z" fill="#E58FA3" />
    </svg>
  );
}

export function FishBone({ className = "" }: S) {
  return (
    <svg viewBox="0 0 80 40" className={className} aria-hidden>
      <g stroke="#D8C7FF" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <circle cx="14" cy="20" r="5" />
        <line x1="20" y1="20" x2="68" y2="20" />
        <line x1="28" y1="14" x2="28" y2="26" />
        <line x1="38" y1="11" x2="38" y2="29" />
        <line x1="48" y1="11" x2="48" y2="29" />
        <line x1="58" y1="14" x2="58" y2="26" />
        <path d="M68 20 L78 12 L78 28 Z" />
      </g>
      <circle cx="12" cy="19" r="1.2" fill="#3B3B3B" />
    </svg>
  );
}

export function PawTrail({ className = "" }: S) {
  const Paw = ({ x, y, r = 1 }: { x: number; y: number; r?: number }) => (
    <g transform={`translate(${x} ${y}) scale(${r})`}>
      <ellipse cx="0" cy="6" rx="6" ry="5" fill="#FFD6BA" />
      <circle cx="-6" cy="-2" r="2.2" fill="#FFD6BA" />
      <circle cx="0" cy="-5" r="2.2" fill="#FFD6BA" />
      <circle cx="6" cy="-2" r="2.2" fill="#FFD6BA" />
    </g>
  );
  return (
    <svg viewBox="0 0 60 200" className={className} aria-hidden>
      <Paw x={20} y={16} r={0.9} />
      <Paw x={40} y={50} r={1} />
      <Paw x={18} y={90} r={1} />
      <Paw x={42} y={130} r={0.95} />
      <Paw x={22} y={170} r={0.9} />
    </svg>
  );
}

export function HeartPaw({ className = "" }: S) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <path
        d="M30 50 C10 36 8 22 18 16 C24 12 28 16 30 20 C32 16 36 12 42 16 C52 22 50 36 30 50 Z"
        fill="#F9C5D5"
      />
      <circle cx="22" cy="28" r="2.5" fill="#FFFDF9" />
      <circle cx="30" cy="24" r="2.5" fill="#FFFDF9" />
      <circle cx="38" cy="28" r="2.5" fill="#FFFDF9" />
      <ellipse cx="30" cy="34" rx="5" ry="3.5" fill="#FFFDF9" />
    </svg>
  );
}

export function StarSparkle({ className = "" }: S) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path
        d="M20 4 L23 17 L36 20 L23 23 L20 36 L17 23 L4 20 L17 17 Z"
        fill="#D8C7FF"
      />
    </svg>
  );
}

/* Page-wide ambient sticker layer.
   Renders behind content with very low opacity. Hidden on small screens
   so the mobile interface stays minimal. */
export function AmbientStickers() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block"
    >
      <SleepingKitten className="absolute right-6 top-24 h-16 w-24 opacity-[0.18] animate-bounce-soft" />
      <PawTrail className="absolute left-2 top-1/3 h-48 w-12 opacity-[0.12]" />
      <FishBone className="absolute right-3 top-2/3 h-8 w-20 opacity-[0.15] animate-spin-slow" />
      <StarSparkle className="absolute left-[12%] top-[18%] h-5 w-5 opacity-30 animate-bounce-soft" />
      <StarSparkle className="absolute right-[18%] bottom-[28%] h-4 w-4 opacity-25 animate-bounce-soft" />
      <HeartPaw className="absolute left-6 bottom-32 h-10 w-10 opacity-[0.18]" />
      <PeekingCat className="absolute bottom-0 right-[8%] h-12 w-16 opacity-[0.22]" />
    </div>
  );
}
