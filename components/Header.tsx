
import React from 'react';
import { BrainCircuit, Languages, Linkedin, Mail, Sun, Moon } from 'lucide-react';
import { Language, Theme, Translations } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: Translations;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage, theme, setTheme, t }) => {
  return (
    <header className="bg-white/80 dark:bg-[#0b0c10]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Futuristic Logo Section */}
          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-400/30 transition-colors duration-500"></div>
              <div className="relative p-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.15)] group-hover:border-cyan-500/30 transition-all duration-300">
                <BrainCircuit className="h-7 w-7 text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors duration-300" />
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-extrabold tracking-tight select-none">
                <span className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 dark:from-cyan-400 dark:via-violet-400 dark:to-fuchsia-400 text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(139,92,246,0.2)] dark:drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                  Neurify
                </span>
              </h1>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase pl-0.5 hidden sm:block">AI Cortex</span>
            </div>
          </div>
          
          {/* Right Side Controls */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            
            {/* Contact / Social Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <a 
                href="https://www.linkedin.com/in/berkay-oruçoğlu-682399219/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="mailto:orucogluberkay66@gmail.com" 
                className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 group"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>

            <div className="hidden md:flex items-center ml-2 mr-2">
              <span className="text-[10px] font-bold tracking-wider text-cyan-600 dark:text-cyan-500/80 bg-cyan-50 dark:bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-200 dark:border-cyan-900/50 shadow-sm">
                {t.poweredBy.replace('Powered by ', '')}
              </span>
            </div>

            <div className="h-6 sm:h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-violet-500/50 transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-violet-400"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
              className="relative group overflow-hidden px-3 sm:px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-all duration-300"
              title="Change Language"
            >
              <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Languages size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors" />
                <span className="hidden sm:inline text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {language === 'tr' ? 'TR' : 'EN'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
