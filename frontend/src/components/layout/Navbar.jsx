import React from 'react';
import { 
  Play, 
  Save, 
  Download, 
  Terminal, 
  Sun, 
  Moon, 
  Cpu
} from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { motion } from 'framer-motion';

const Navbar = ({ toggleConsole, isConsoleOpen }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className="h-16 flex items-center justify-between px-6 z-50 sticky top-0"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Cpu className="text-white w-6 h-6" />
        </div>
        <span className="font-sora font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
          FLOWML STUDIO
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run Pipeline</span>
        </motion.button>

        <div className="h-6 w-px mx-2" style={{ backgroundColor: 'var(--color-border)' }} />

        <div className="flex items-center gap-2">
          <NavButton icon={<Save className="w-4 h-4" />} label="Save" />
          <NavButton icon={<Download className="w-4 h-4" />} label="Export" />
          <NavButton
            icon={<Terminal className="w-4 h-4" />}
            label="Console"
            onClick={toggleConsole}
            active={isConsoleOpen}
          />
        </div>

        <div className="h-6 w-px mx-2" style={{ backgroundColor: 'var(--color-border)' }} />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-border) 20%, transparent)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

      </div>
    </nav>
  );
};

const NavButton = ({ icon, label, onClick, active }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
      active ? 'bg-primary/10 text-primary border border-primary/20' : ''
    }`}
    style={!active ? { color: 'var(--color-text-muted)' } : {}}
    onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-border) 20%, transparent)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
  </motion.button>
);

export default Navbar;
