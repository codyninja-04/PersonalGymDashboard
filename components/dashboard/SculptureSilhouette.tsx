// Stylized classical sculpture silhouette — evokes Michelangelo's David / contrapposto.
// Used as a translucent background watermark in the hero.

export function SculptureSilhouette({ className = "", strokeWidth = 1.2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 600 1000"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* Head — classical oval */}
      <path d="M 300 80 C 264 82, 244 116, 248 162 C 252 208, 278 232, 300 232 C 322 232, 348 208, 352 162 C 356 116, 336 78, 300 80 Z" />
      {/* Brow / nose hint */}
      <path d="M 286 138 L 286 158" opacity="0.6" />
      <path d="M 314 138 L 314 158" opacity="0.6" />
      <path d="M 296 178 Q 300 188 304 178" opacity="0.5" />
      {/* Neck */}
      <path d="M 282 226 L 270 268" />
      <path d="M 318 226 L 330 268" />
      <path d="M 282 248 Q 300 256 318 248" opacity="0.5" />
      {/* Sternocleidomastoid */}
      <path d="M 290 232 L 300 268" opacity="0.4" />
      {/* Trapezius / shoulder sweep */}
      <path d="M 270 268 C 230 274, 188 290, 156 322" />
      <path d="M 330 268 C 370 274, 412 290, 444 322" />
      {/* Deltoids */}
      <path d="M 156 322 C 134 350, 124 384, 130 420 L 152 432" />
      <path d="M 444 322 C 466 350, 476 384, 470 420 L 448 432" />
      {/* Pec outlines */}
      <path d="M 270 282 C 246 312, 232 364, 232 420 L 232 446" />
      <path d="M 330 282 C 354 312, 368 364, 368 420 L 368 446" />
      <path d="M 232 446 Q 300 462 368 446" />
      <path d="M 232 420 Q 300 440 368 420" opacity="0.55" />
      {/* Sternum line */}
      <path d="M 300 286 L 300 478" opacity="0.85" />
      {/* Serratus suggestion */}
      <path d="M 232 446 L 222 478 L 232 502" opacity="0.5" />
      <path d="M 368 446 L 378 478 L 368 502" opacity="0.5" />
      {/* Rectus abdominis — six pack */}
      <path d="M 268 478 L 332 478" />
      <path d="M 268 514 L 332 514" />
      <path d="M 268 550 L 332 550" />
      <path d="M 268 588 L 332 588" opacity="0.6" />
      <path d="M 270 478 L 270 600" opacity="0.55" />
      <path d="M 330 478 L 330 600" opacity="0.55" />
      {/* Obliques sweeping down to hips */}
      <path d="M 232 502 C 244 548, 254 586, 268 620" />
      <path d="M 368 502 C 356 548, 346 586, 332 620" />
      {/* Arms — relaxed at sides, slight bend (contrapposto) */}
      <path d="M 152 432 L 132 498 L 118 568 L 108 638 L 102 700" />
      <path d="M 448 432 L 472 498 L 488 568 L 502 638 L 510 700" />
      {/* Forearm + hand suggestion */}
      <path d="M 102 700 L 96 760" opacity="0.7" />
      <path d="M 510 700 L 516 760" opacity="0.7" />
      {/* Iliac crest / hip line */}
      <path d="M 232 620 Q 300 636 368 620" />
      {/* V-line / inguinal */}
      <path d="M 268 620 L 300 678" opacity="0.7" />
      <path d="M 332 620 L 300 678" opacity="0.7" />
      {/* Suggestion of standing leg (contrapposto — right leg planted, left relaxed) */}
      <path d="M 268 678 C 262 740, 256 808, 252 880 L 254 968" />
      <path d="M 332 678 C 338 740, 348 800, 358 870 L 360 968" />
      {/* Quad inner line */}
      <path d="M 296 700 L 286 880" opacity="0.45" />
      <path d="M 304 700 L 318 880" opacity="0.45" />
      {/* Base / plinth hint */}
      <path d="M 220 968 L 380 968" opacity="0.5" />
      <path d="M 200 988 L 400 988" opacity="0.3" />
    </svg>
  );
}
