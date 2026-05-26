type Props = {
  className?: string;
};

export function OllieBabySvg({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ollie baby owl"
    >
      {/* shadow */}
      <ellipse cx="110" cy="196" rx="44" ry="10" fill="rgba(24,16,10,0.18)" />

      {/* wings */}
      <g className="ollie-wing-left">
        <path
          d="
            M62 102
            C38 118 34 148 50 170
            C72 160 82 134 76 106
            Z
          "
          fill="#a7672f"
        />

        <path
          d="
            M57 120
            C51 132 52 145 59 156
          "
          stroke="#87501f"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
      </g>

      <g className="ollie-wing-right">
        <path
          d="
            M158 102
            C182 118 186 148 170 170
            C148 160 138 134 144 106
            Z
          "
          fill="#a7672f"
        />

        <path
          d="
            M163 120
            C169 132 168 145 161 156
          "
          stroke="#87501f"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
      </g>

      {/* body */}
      <g className="ollie-body">
        <path
          d="
            M110 40
            C152 40 176 74 172 124
            C168 170 142 192 110 192
            C78 192 52 170 48 124
            C44 74 68 40 110 40
            Z
          "
          fill="#c57a35"
        />

        {/* ears */}
        <path d="M84 48 L94 18 L108 50 Z" fill="#9c5b28" />

        <path d="M136 48 L126 18 L112 50 Z" fill="#9c5b28" />

        {/* belly */}
        <ellipse cx="110" cy="132" rx="42" ry="48" fill="#fff0cf" />

        {/* belly feathers */}
        <g opacity="0.45" fill="#d79b65">
          <path d="M92 122 Q96 114 100 122 Q96 130 92 122 Z" />
          <path d="M110 122 Q114 114 118 122 Q114 130 110 122 Z" />
          <path d="M128 122 Q132 114 136 122 Q132 130 128 122 Z" />

          <path d="M92 142 Q96 134 100 142 Q96 150 92 142 Z" />
          <path d="M110 142 Q114 134 118 142 Q114 150 110 142 Z" />
          <path d="M128 142 Q132 134 136 142 Q132 150 128 142 Z" />

          <path d="M101 160 Q106 152 111 160 Q106 168 101 160 Z" />
          <path d="M119 160 Q124 152 129 160 Q124 168 119 160 Z" />
        </g>
      </g>

      {/* face */}
      <g className="ollie-face">
        <path
          d="
            M70 82
            C78 58 96 52 110 66
            C124 52 142 58 150 82
            C142 108 124 116 110 102
            C96 116 78 108 70 82
            Z
          "
          fill="#fff8ea"
        />

        {/* eyes */}
        <g className="ollie-eye-left">
          <circle cx="89" cy="88" r="16" fill="#2d1d12" />
          <circle cx="94" cy="82" r="5" fill="#fffdf6" />
          <circle cx="85" cy="92" r="2.5" fill="#8f5b2e" />
        </g>

        <g className="ollie-eye-right">
          <circle cx="131" cy="88" r="16" fill="#2d1d12" />
          <circle cx="136" cy="82" r="5" fill="#fffdf6" />
          <circle cx="127" cy="92" r="2.5" fill="#8f5b2e" />
        </g>

        {/* blush */}
        <circle cx="74" cy="108" r="7" fill="#e59a88" opacity="0.28" />

        <circle cx="146" cy="108" r="7" fill="#e59a88" opacity="0.28" />

        {/* beak */}
        <path
          d="
            M110 98
            L99 112
            H121
            Z
          "
          fill="#f0a53b"
        />
      </g>

      {/* feet */}
      <g className="ollie-feet">
        <path
          d="M94 188 C96 194 102 194 105 188"
          stroke="#e0a23a"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path
          d="M115 188 C118 194 124 194 127 188"
          stroke="#e0a23a"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
