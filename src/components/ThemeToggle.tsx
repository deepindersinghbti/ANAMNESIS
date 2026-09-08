import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/themeContext';
import { soundFx } from '../lib/soundFx';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = true,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const handleToggle = () => {
    soundFx.playClick();
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      id="theme-toggle-btn"
      type="button"
      aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
      title={isLight ? '☀️ Light Mode active — Click for 🌙 Dark Mode' : '🌙 Dark Mode active — Click for ☀️ Light Mode'}
      className={`theme-toggle-btn px-2.5 py-1 rounded-lg border font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
        isLight
          ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-300/80 text-amber-900 shadow-amber-900/5'
          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-purple-300'
      } ${className}`}
    >
      <span className="flex items-center justify-center">
        {isLight ? (
          <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-200 hover:rotate-45" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-purple-400 transition-transform duration-200 hover:-rotate-12" />
        )}
      </span>
      {showLabel && (
        <span className="hidden sm:inline text-[10px] tracking-wider uppercase font-semibold">
          {isLight ? 'LIGHT' : 'DARK'}
        </span>
      )}
    </button>
  );
};
