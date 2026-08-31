import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const pixelMap = {
    sm: 32,
    md: 48,
    lg: 80,
    xl: 128,
  };

  const dim = pixelMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* SVG Vector recreation of the circular ANAMESIS logo with exact gradients */}
      <svg
        viewBox="0 0 200 200"
        className={`${sizeMap[size]} drop-shadow-[0_0_15px_rgba(236,72,153,0.35)]`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Ring & Letter Gradient: Electric Blue -> Purple -> Magenta -> Pink -> Orange -> Golden Yellow */}
          <linearGradient id="anamnesisRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="25%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="75%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          <linearGradient id="anamnesisLetterGrad" x1="20%" y1="90%" x2="80%" y2="10%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="35%" stopColor="#8b5cf6" />
            <stop offset="65%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          <linearGradient id="anamnesisGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Curved path for text along circle */}
          <path
            id="textPathArc"
            d="M 32 100 A 68 68 0 1 1 168 100"
            fill="none"
          />
        </defs>

        {/* Outer Background Circle Base */}
        <circle cx="100" cy="100" r="96" fill="#000000" />

        {/* Outer Gradient Ring */}
        <circle
          cx="100"
          cy="100"
          r="84"
          stroke="url(#anamnesisRingGrad)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Outer subtle accent arc lines */}
        <circle
          cx="100"
          cy="100"
          r="92"
          stroke="url(#anamnesisRingGrad)"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* Two Accent Dots on the sides */}
        <circle cx="32" cy="106" r="3" fill="#3b82f6" />
        <circle cx="168" cy="106" r="3" fill="#f97316" />

        {/* Arched Text: ANAMESIS */}
        <text
          fill="url(#anamnesisRingGrad)"
          fontSize="18.5"
          fontWeight="900"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          letterSpacing="10"
        >
          <textPath
            href="#textPathArc"
            startOffset="50%"
            textAnchor="middle"
          >
            ANAMESIS
          </textPath>
        </text>

        {/* Stylized "A" Triangle Structure */}
        {/* Left leg of A (Blue to Purple) */}
        <path
          d="M 64 132 L 95 62 Q 100 52 105 62 L 136 132"
          stroke="url(#anamnesisLetterGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Magnifying Glass in the center of A */}
        {/* Glass Rim */}
        <circle
          cx="100"
          cy="114"
          r="16"
          stroke="url(#anamnesisGlassGrad)"
          strokeWidth="5"
          fill="#000000"
          fillOpacity="0.8"
        />

        {/* Glass Handle pointing down-right */}
        <path
          d="M 111 125 L 124 139"
          stroke="url(#anamnesisRingGrad)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Glass Inner Reflection */}
        <path
          d="M 93 108 A 10 10 0 0 1 106 106"
          stroke="#ffffff"
          strokeWidth="2"
          strokeOpacity="0.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {showText && (
        <div className="ml-3">
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-[#3b82f6] via-[#ec4899] to-[#f97316] bg-clip-text text-transparent font-mono">
            ANAMESIS
          </span>
          <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
            A Digital Crime-Scene Intelligence
          </p>
        </div>
      )}
    </div>
  );
};
