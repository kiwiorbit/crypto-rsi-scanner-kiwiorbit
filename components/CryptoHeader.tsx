import React, { useState, useRef, useEffect, memo } from 'react';
import type { Timeframe, Theme } from '../types';

interface CryptoHeaderProps {
    theme: Theme;
    onThemeToggle: () => void;
    timeframe: Timeframe;
    onTimeframeChange: (timeframe: Timeframe) => void;
    onSettingsToggle: () => void;
    timeframes: { value: Timeframe; label: string }[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

const CryptoHeader: React.FC<CryptoHeaderProps> = ({
    theme,
    onThemeToggle,
    timeframe,
    onTimeframeChange,
    onSettingsToggle,
    timeframes,
    searchTerm,
    onSearchChange,
}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleToggleSearch = () => {
        if (isSearchOpen) {
            onSearchChange('');
        }
        setIsSearchOpen(!isSearchOpen);
    };

    useEffect(() => {
        if (isSearchOpen) {
            // Timeout to allow the CSS transition to complete before focusing
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isSearchOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSearchOpen && searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
                onSearchChange('');
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
                onSearchChange('');
            }
        };

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isSearchOpen, onSearchChange]);

    return (
        <header className="fixed top-0 left-0 right-0 p-4 z-30 header-on-load">
            <div className="relative bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/30 dark:border-dark-border/30 rounded-2xl transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-slate-400/20 dark:hover:shadow-primary/20 hover:border-primary-light/40 dark:hover:border-primary/80 overflow-hidden">
                <div className="aurora-container">
                    <div className="aurora-shape aurora-shape1"></div>
                    <div className="aurora-shape aurora-shape2"></div>
                    <div className="aurora-shape aurora-shape3"></div>
                </div>
                <div className="relative z-10 p-4 flex flex-col md:flex-row items-center md:justify-between gap-4">
                    {/* Left Side: Title and Branding */}
                    <div className="text-center md:text-left header-title-group">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <i className="fa-solid fa-chart-line text-primary-light dark:text-primary text-3xl"></i>
                            <div>
                                <h1 className="text-xl font-bold text-dark-text dark:text-light-text tracking-tight">Crypto RSI Scanner</h1>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Controls */}
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-4 header-controls-group">
                        <div className="relative bg-light-bg dark:bg-dark-bg rounded-lg px-3 py-2 flex items-center shadow-sm border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition cursor-pointer">
                            <select
                                id="timeframe"
                                value={timeframe}
                                onChange={(e) => onTimeframeChange(e.target.value as Timeframe)}
                                className="bg-transparent outline-none text-base font-semibold text-dark-text dark:text-light-text pr-8 pl-2 py-1 rounded appearance-none border-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary transition"
                            >
                                {timeframes.map(tf => (
                                    <option key={tf.value} value={tf.value} className="bg-light-card dark:bg-dark-card text-dark-text dark:text-light-text">{tf.label}</option>
                                ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary-light dark:text-primary">▼</span>
                        </div>
                        <button
                            onClick={onThemeToggle}
                            className="bg-light-bg dark:bg-dark-bg rounded-lg p-2 w-[42px] h-[42px] flex items-center justify-center border border-light-border dark:border-dark-border shadow-sm hover:bg-light-border dark:hover:bg-dark-border transition"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <i className="fa-solid fa-sun text-primary-light dark:text-primary text-[22px]"></i>
                            ) : (
                                <i className="fa-solid fa-moon text-primary-light dark:text-primary text-[22px]"></i>
                            )}
                        </button>
                        <button
                            id="settingsBtn"
                            onClick={onSettingsToggle}
                            className="bg-light-bg dark:bg-dark-bg rounded-lg p-2 w-[42px] h-[42px] flex items-center justify-center border border-light-border dark:border-dark-border shadow-sm hover:bg-light-border dark:hover:bg-dark-border transition"
                            aria-label="Open settings"
                        >
                            <i className="fa-solid fa-gear text-primary-light dark:text-primary text-[22px]"></i>
                        </button>
                        <div ref={searchRef} className="relative flex items-center justify-end">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search symbol..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className={`h-[42px] rounded-lg bg-light-bg dark:bg-dark-bg pl-4 pr-12 text-dark-text dark:text-light-text outline-none border border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary-light dark:focus:ring-primary absolute right-0 top-0 transition-all duration-300 ease-in-out ${isSearchOpen ? 'w-40 sm:w-48 opacity-100' : 'w-10 opacity-0 pointer-events-none'}`}
                            />
                            <button
                                onClick={handleToggleSearch}
                                className="relative z-10 bg-light-bg dark:bg-dark-bg rounded-lg p-2 w-[42px] h-[42px] flex items-center justify-center border border-light-border dark:border-dark-border shadow-sm hover:bg-light-border dark:hover:bg-dark-border transition"
                                aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                            >
                                <i className={`fa-solid ${isSearchOpen ? 'fa-xmark' : 'fa-search'} text-primary-light dark:text-primary text-[20px] transition-transform duration-300 ease-in-out ${isSearchOpen ? 'rotate-180' : 'rotate-0'}`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default memo(CryptoHeader);