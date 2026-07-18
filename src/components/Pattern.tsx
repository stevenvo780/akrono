import { brand } from "@/lib/brand";

interface PatternProps {
  variant?: "hero" | "band" | "tile";
  className?: string;
  opacity?: number;
  colors?: string[];
}

export default function Pattern({
  variant = "tile",
  className = "",
  opacity = 1,
  colors,
}: PatternProps) {
  // Default to akrono brand colors
  const colorPalette = colors ?? [
    brand.navy,
    brand.violet,
    brand.magenta,
    brand.cyan,
    brand.ochre,
  ];

  if (variant === "hero") {
    return (
      <svg
        className={className}
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{ opacity }}
      >
        {/* Cascading crescents and dots in hero composition */}
        {/* Row 1: Top left cluster */}
        <g>
          {/* Crescent 1 */}
          <path
            d="M150 120 A60 60 0 1 0 150 240"
            stroke={colorPalette[0]}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="225" cy="180" r="8" fill={colorPalette[1]} />

          {/* Crescent 2 */}
          <path
            d="M280 160 A50 50 0 1 0 280 260"
            stroke={colorPalette[2]}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="345" cy="210" r="7" fill={colorPalette[3]} />
        </g>

        {/* Row 2: Top right area */}
        <g>
          {/* Crescent 3 */}
          <path
            d="M950 100 A70 70 0 1 0 950 240"
            stroke={colorPalette[4]}
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="1035" cy="170" r="9" fill={colorPalette[0]} />

          {/* Crescent 4 */}
          <path
            d="M1070 180 A55 55 0 1 0 1070 290"
            stroke={colorPalette[1]}
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="1140" cy="235" r="8" fill={colorPalette[2]} />
        </g>

        {/* Row 3: Middle left */}
        <g>
          {/* Crescent 5 */}
          <path
            d="M80 420 A65 65 0 1 0 80 550"
            stroke={colorPalette[3]}
            strokeWidth="13"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="160" cy="485" r="8" fill={colorPalette[4]} />

          {/* Crescent 6 */}
          <path
            d="M200 380 A52 52 0 1 0 200 484"
            stroke={colorPalette[0]}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="265" cy="432" r="7" fill={colorPalette[1]} />
        </g>

        {/* Row 4: Center */}
        <g>
          {/* Crescent 7 */}
          <path
            d="M550 350 A75 75 0 1 0 550 500"
            stroke={colorPalette[2]}
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="645" cy="425" r="10" fill={colorPalette[3]} />
        </g>

        {/* Row 5: Bottom right */}
        <g>
          {/* Crescent 8 */}
          <path
            d="M920 550 A68 68 0 1 0 920 686"
            stroke={colorPalette[4]}
            strokeWidth="13"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="1003" cy="618" r="9" fill={colorPalette[0]} />

          {/* Crescent 9 */}
          <path
            d="M1050 480 A58 58 0 1 0 1050 596"
            stroke={colorPalette[1]}
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="1120" cy="538" r="8" fill={colorPalette[2]} />
        </g>

        {/* Row 6: Bottom left scatter */}
        <g>
          {/* Crescent 10 */}
          <path
            d="M120 680 A50 50 0 1 0 120 780"
            stroke={colorPalette[3]}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="185" cy="730" r="7" fill={colorPalette[4]} />

          {/* Crescent 11 */}
          <path
            d="M320 630 A62 62 0 1 0 320 754"
            stroke={colorPalette[0]}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="397" cy="692" r="8" fill={colorPalette[1]} />
        </g>
      </svg>
    );
  }

  if (variant === "band") {
    return (
      <svg
        className={className}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        width="100%"
        height="auto"
        aria-hidden="true"
        style={{ opacity, display: "block" }}
      >
        {/* Horizontal band with alternating crescents and dots */}
        <g>
          {Array.from({ length: 8 }).map((_, i) => {
            const x = 120 + i * 140;
            const color1 = colorPalette[i % colorPalette.length];
            const color2 = colorPalette[(i + 1) % colorPalette.length];
            return (
              <g key={i}>
                {/* Crescent */}
                <path
                  d={`M${x} 25 A35 35 0 1 0 ${x} 95`}
                  stroke={color1}
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Dot */}
                <circle cx={x + 50} cy={60} r="5" fill={color2} />
              </g>
            );
          })}
        </g>
      </svg>
    );
  }

  // Default: "tile" variant with repeating pattern
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id="crescent-pattern"
          x="0"
          y="0"
          width="200"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          {/* Top-left crescent and dot */}
          <path
            d="M30 30 A40 40 0 1 0 30 110"
            stroke={colorPalette[0]}
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={30 + 55} cy={70} r="5" fill={colorPalette[1]} />

          {/* Top-right crescent and dot (offset) */}
          <path
            d="M130 50 A38 38 0 1 0 130 126"
            stroke={colorPalette[2]}
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={130 + 52} cy={88} r="5" fill={colorPalette[3]} />

          {/* Bottom-left crescent and dot */}
          <path
            d="M40 140 A36 36 0 1 0 40 212"
            stroke={colorPalette[4]}
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={40 + 50} cy={176} r="5" fill={colorPalette[0]} />

          {/* Bottom-right crescent and dot (small) */}
          <path
            d="M140 160 A32 32 0 1 0 140 224"
            stroke={colorPalette[1]}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={140 + 46} cy={192} r="5" fill={colorPalette[2]} />

          {/* Center accent dot cluster */}
          <circle cx={100} cy={100} r="3" fill={colorPalette[3]} />
          <circle cx={110} cy={95} r="2" fill={colorPalette[4]} />
          <circle cx={95} cy={105} r="2" fill={colorPalette[0]} />
        </pattern>
      </defs>

      {/* Fill entire SVG with pattern */}
      <rect width="200" height="200" fill="url(#crescent-pattern)" />
    </svg>
  );
}
