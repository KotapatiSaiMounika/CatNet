type IconProps = { size?: number; className?: string };

/* Simple flat cat logo */
export function CatLogo({
  size = 32,
  sleeping = false,
  className = "",
}: IconProps & { sleeping?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="catBody" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFD6BA" />
          <stop offset="100%" stopColor="#F9C5D5" />
        </linearGradient>
      </defs>
      {/* ears */}
      <path d="M14 22 L20 8 L26 22 Z" fill="url(#catBody)" />
      <path d="M38 22 L44 8 L50 22 Z" fill="url(#catBody)" />
      <path d="M17 19 L20 12 L23 19 Z" fill="#F9C5D5" opacity="0.6" />
      <path d="M41 19 L44 12 L47 19 Z" fill="#F9C5D5" opacity="0.6" />
      {/* head */}
      <circle cx="32" cy="36" r="20" fill="url(#catBody)" />
      {/* eyes */}
      {sleeping ? (
        <>
          <path
            d="M22 34 Q26 38 30 34"
            stroke="#3B3B3B"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M34 34 Q38 38 42 34"
            stroke="#3B3B3B"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <ellipse cx="25" cy="35" rx="2" ry="3" fill="#3B3B3B" className="animate-blink" />
          <ellipse cx="39" cy="35" rx="2" ry="3" fill="#3B3B3B" className="animate-blink" />
          <circle cx="25.6" cy="34" r="0.7" fill="white" />
          <circle cx="39.6" cy="34" r="0.7" fill="white" />
        </>
      )}
      {/* nose + mouth */}
      <path d="M30 41 L32 43 L34 41 Z" fill="#E58FA3" />
      <path
        d="M32 43 Q29 46 27 44 M32 43 Q35 46 37 44"
        stroke="#3B3B3B"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* cheek blush */}
      <circle cx="22" cy="42" r="2.5" fill="#F9C5D5" opacity="0.7" />
      <circle cx="42" cy="42" r="2.5" fill="#F9C5D5" opacity="0.7" />
    </svg>
  );
}

/* Bigger illustrated cat for hero */
export function HeroCat({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 420"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="heroBody" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFE5D0" />
          <stop offset="100%" stopColor="#F9C5D5" />
        </linearGradient>
        <radialGradient id="heroBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="100%" stopColor="#FCE7EE" />
        </radialGradient>
      </defs>
      <circle cx="210" cy="210" r="200" fill="url(#heroBg)" />
      {/* tail */}
      <path
        d="M310 280 Q360 250 350 200 Q340 160 300 175"
        stroke="#F9C5D5"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
        className="animate-tail"
        style={{ transformOrigin: "310px 280px" }}
      />
      {/* body */}
      <ellipse cx="210" cy="300" rx="120" ry="70" fill="url(#heroBody)" />
      {/* paws */}
      <ellipse cx="160" cy="360" rx="22" ry="14" fill="#FFE5D0" />
      <ellipse cx="260" cy="360" rx="22" ry="14" fill="#FFE5D0" />
      {/* head */}
      <circle cx="210" cy="190" r="105" fill="url(#heroBody)" />
      {/* ears */}
      <path d="M125 145 L140 70 L180 130 Z" fill="#F9C5D5" />
      <path d="M295 145 L280 70 L240 130 Z" fill="#F9C5D5" />
      <path d="M140 130 L148 90 L168 130 Z" fill="#FFD6BA" />
      <path d="M280 130 L272 90 L252 130 Z" fill="#FFD6BA" />
      {/* eyes */}
      <ellipse cx="180" cy="185" rx="10" ry="14" fill="#3B3B3B" className="animate-blink" />
      <ellipse cx="240" cy="185" rx="10" ry="14" fill="#3B3B3B" className="animate-blink" />
      <circle cx="183" cy="180" r="3" fill="white" />
      <circle cx="243" cy="180" r="3" fill="white" />
      {/* nose */}
      <path d="M205 215 L210 222 L215 215 Z" fill="#E58FA3" />
      {/* mouth */}
      <path
        d="M210 222 Q200 235 192 228 M210 222 Q220 235 228 228"
        stroke="#3B3B3B"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* whiskers */}
      <g stroke="#B89A85" strokeWidth="1.6" strokeLinecap="round">
        <line x1="160" y1="220" x2="125" y2="215" />
        <line x1="160" y1="228" x2="125" y2="232" />
        <line x1="260" y1="220" x2="295" y2="215" />
        <line x1="260" y1="228" x2="295" y2="232" />
      </g>
      {/* cheeks */}
      <circle cx="155" cy="215" r="10" fill="#F9C5D5" opacity="0.55" />
      <circle cx="265" cy="215" r="10" fill="#F9C5D5" opacity="0.55" />
      {/* tiny heart */}
      <g transform="translate(330,120)">
        <path
          d="M0 4 C-4 -2 -12 -2 -12 6 C-12 14 0 22 0 22 C0 22 12 14 12 6 C12 -2 4 -2 0 4 Z"
          fill="#F9C5D5"
          className="animate-bounce-soft"
        />
      </g>
    </svg>
  );
}

export function PawPrint({
  size = 24,
  className = "",
  color = "#F9C5D5",
}: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <ellipse cx="16" cy="22" rx="7" ry="6" fill={color} />
      <circle cx="8" cy="14" r="3" fill={color} />
      <circle cx="16" cy="10" r="3" fill={color} />
      <circle cx="24" cy="14" r="3" fill={color} />
    </svg>
  );
}

export function Butterfly({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <g className="animate-butterfly">
        <ellipse cx="20" cy="22" rx="14" ry="10" fill="#D8C7FF" opacity="0.85" />
        <ellipse cx="40" cy="22" rx="14" ry="10" fill="#D6EEFF" opacity="0.85" />
        <ellipse cx="22" cy="36" rx="10" ry="8" fill="#FFD6BA" opacity="0.85" />
        <ellipse cx="38" cy="36" rx="10" ry="8" fill="#F9C5D5" opacity="0.85" />
        <rect x="29" y="14" width="2" height="30" rx="1" fill="#3B3B3B" />
        <circle cx="30" cy="13" r="2" fill="#3B3B3B" />
      </g>
    </svg>
  );
}

export function YarnBall({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <circle cx="30" cy="30" r="22" fill="#F9C5D5" />
      <g stroke="#E58FA3" strokeWidth="1.5" fill="none" opacity="0.7">
        <path d="M10 25 Q30 5 50 25" />
        <path d="M10 35 Q30 55 50 35" />
        <path d="M14 18 Q30 30 46 42" />
        <path d="M14 42 Q30 30 46 18" />
      </g>
    </svg>
  );
}

export function Blob({
  className = "",
  color = "#F9C5D5",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <path
        fill={color}
        d="M40,-65C50.7,-58.2,57.1,-44.6,63.8,-31.4C70.5,-18.2,77.5,-5.5,76.4,6.7C75.3,18.9,66.1,30.6,56.4,41.5C46.7,52.4,36.4,62.5,23.7,68.5C11,74.5,-4.1,76.4,-19.1,73.6C-34.1,70.8,-49,63.3,-58.7,51.8C-68.4,40.3,-72.9,24.8,-73.9,9.4C-74.9,-6,-72.4,-21.3,-65.5,-34.3C-58.6,-47.3,-47.3,-58,-34.6,-64C-21.9,-70,-7.9,-71.3,5.8,-79.7C19.5,-88.1,29.3,-71.8,40,-65Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

export function Magnifier({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <circle cx="80" cy="80" r="60" fill="#FFFDF9" stroke="#D8C7FF" strokeWidth="8" />
      <rect
        x="115"
        y="115"
        width="60"
        height="14"
        rx="7"
        transform="rotate(45 115 115)"
        fill="#D8C7FF"
      />
      <circle cx="60" cy="75" r="3" fill="#3B3B3B" />
      <circle cx="90" cy="75" r="3" fill="#3B3B3B" />
      <path d="M65 95 Q80 105 95 95" stroke="#3B3B3B" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
