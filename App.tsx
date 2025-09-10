
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CryptoHeader from './components/CryptoHeader';
import Grid from './components/Grid';
import Modal from './components/Modal';
import SettingsPanel from './components/SettingsPanel';
import Footer from './components/Footer';
import AssetListModal from './components/AssetListModal';
import ThemeModal from './components/ThemeModal';
import { DEFAULT_SYMBOLS, TIMEFRAMES, LIGHT_THEME_SETTINGS, DARK_THEME_SETTINGS } from './constants';
import type { Settings, SymbolData, Timeframe, Theme, Toast, SortOrder } from './types';
import { fetchRsiForSymbol } from './services/binanceService';

// === Splash Screen Component ===
const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen" aria-live="polite" aria-label="Loading Crypto RSI Scanner">
      <div className="splash-content">
        <svg className="splash-logo" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M 10 70 L 40 20 L 60 60 L 90 10 L 120 70 L 150 30 L 190 60" />
        </svg>
        <h1 className="splash-title">Crypto RSI Scanner</h1>
      </div>
    </div>
  );
};

// === Toast Notification Components ===
interface ToastNotificationProps {
  toast: Toast;
  onRemove: (id: number) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };
  
  const isOverbought = toast.type === 'overbought';
  const accentColor = isOverbought ? 'bg-red-500' : 'bg-green-500';
  const icon = isOverbought ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
  const title = `${toast.symbol} (${toast.timeframe})`;
  const body = `is now ${isOverbought ? 'Overbought' : 'Oversold'} at ${toast.rsi.toFixed(2)}`;

  return (
    <div
      className={`relative w-full max-w-xs p-4 overflow-hidden rounded-xl shadow-2xl bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-lg border border-light-border/50 dark:border-dark-border/50 text-dark-text dark:text-light-text transition-all duration-300 ease-in-out ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`}></div>
      <div className="flex items-start pl-3">
        <div className="flex-shrink-0 pt-0.5">
          <i className={`fa-solid ${icon} text-xl ${isOverbought ? 'text-red-500' : 'text-green-500'}`}></i>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-bold">{title}</p>
          <p className="mt-1 text-sm">{body}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button onClick={handleClose} className="inline-flex text-medium-text-light dark:text-medium-text hover:text-dark-text dark:hover:text-light-text focus:outline-none" aria-label="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-[100] w-full max-w-xs space-y-3">
    {toasts.map(toast => <ToastNotification key={toast.id} toast={toast} onRemove={onRemove} />)}
  </div>
);

// === Main App Component ===
const App: React.FC = () => {
    const [isInitializing, setIsInitializing] = useState(() => {
        // Show splash only if 'hasSeenSplash' is not in sessionStorage
        return !sessionStorage.getItem('hasSeenSplash');
    });

    useEffect(() => {
        if (isInitializing) {
            sessionStorage.setItem('hasSeenSplash', 'true');
            const timer = setTimeout(() => {
                setIsInitializing(false); 
            }, 5000); // Total splash screen duration

            return () => clearTimeout(timer);
        }
    }, [isInitializing]);
    
    const [theme, setTheme] = useState<Theme>('dark');
    const [settings, setSettings] = useState<Settings>(DARK_THEME_SETTINGS);
    const [timeframe, setTimeframe] = useState<Timeframe>('15m');
    const [cellSize, setCellSize] = useState<number>(120);
    const [symbolsData, setSymbolsData] = useState<Record<string, SymbolData>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [allSymbols, setAllSymbols] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('crypto-all-symbols');
            return saved ? JSON.parse(saved) : DEFAULT_SYMBOLS;
        } catch (error) {
            console.error("Failed to parse all symbols from localStorage", error);
            return DEFAULT_SYMBOLS;
        }
    });

    const [userSymbols, setUserSymbols] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('crypto-user-symbols');
            return saved ? JSON.parse(saved) : allSymbols;
        } catch (error) {
            console.error("Failed to parse user symbols from localStorage", error);
            return allSymbols;
        }
    });

    const [favorites, setFavorites] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('crypto-favorites');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to parse favorites from localStorage", error);
            return [];
        }
    });
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState<SortOrder>('default');

    const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

    // RSI Alert State
    const [areAlertsEnabled, setAreAlertsEnabled] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('crypto-alerts-enabled');
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });
    const [lastAlertedRsiStatus, setLastAlertedRsiStatus] = useState<Record<string, 'overbought' | 'oversold' | 'neutral'>>({});
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
        }
        document.body.style.backgroundColor = settings.bgColor;
    }, [theme, settings.bgColor]);
    
    useEffect(() => {
        localStorage.setItem('crypto-all-symbols', JSON.stringify(allSymbols));
    }, [allSymbols]);

    useEffect(() => {
        localStorage.setItem('crypto-user-symbols', JSON.stringify(userSymbols));
    }, [userSymbols]);

    useEffect(() => {
        localStorage.setItem('crypto-favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('crypto-alerts-enabled', JSON.stringify(areAlertsEnabled));
    }, [areAlertsEnabled]);

    const handleThemeToggle = useCallback(() => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        setSettings(newTheme === 'light' ? LIGHT_THEME_SETTINGS : DARK_THEME_SETTINGS);
    }, [theme]);
    
    const fetchData = useCallback(async (selectedTimeframe: Timeframe) => {
        if (userSymbols.length === 0) {
            setSymbolsData({});
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const promises = userSymbols.map(symbol => fetchRsiForSymbol(symbol, selectedTimeframe));
            const results = await Promise.all(promises);
            const newData: Record<string, SymbolData> = {};
            results.forEach((data, index) => {
                newData[userSymbols[index]] = data;
            });
            setSymbolsData(newData);
        } catch (error) {
            console.error("Failed to fetch all symbol data:", error);
        } finally {
            setLoading(false);
        }
    }, [userSymbols]);

    useEffect(() => {
        fetchData(timeframe);
        const interval = setInterval(() => fetchData(timeframe), 60000);
        return () => clearInterval(interval);
    }, [timeframe, fetchData]);

    const addToast = (toast: Omit<Toast, 'id'>) => {
        setToasts(prev => [...prev, { ...toast, id: Date.now() }]);
    };
    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // This effect handles sending notifications when data changes
    useEffect(() => {
        const ALLOWED_TIMEFRAMES_FOR_ALERTS: Timeframe[] = ['15m', '30m', '1h', '2h', '4h', '8h', '1d', '3d', '1w'];
        
        if (!areAlertsEnabled || !ALLOWED_TIMEFRAMES_FOR_ALERTS.includes(timeframe) || Object.keys(symbolsData).length === 0) {
            return;
        }

        const newAlertStatus = { ...lastAlertedRsiStatus };
        const overboughtThreshold = 70;
        const oversoldThreshold = 30;
        
        Object.keys(symbolsData).forEach(symbol => {
            const symbolData = symbolsData[symbol];
            if (!symbolData || symbolData.rsi.length === 0) return;

            const lastRsi = symbolData.rsi[symbolData.rsi.length - 1].value;
            const previousStatus = lastAlertedRsiStatus[symbol] || 'neutral';
            let currentStatus: 'overbought' | 'oversold' | 'neutral' = 'neutral';
            
            if (lastRsi >= overboughtThreshold) {
                currentStatus = 'overbought';
                if (previousStatus !== 'overbought') {
                    addToast({ symbol, timeframe, rsi: lastRsi, type: 'overbought' });
                }
            } else if (lastRsi <= oversoldThreshold) {
                currentStatus = 'oversold';
                if (previousStatus !== 'oversold') {
                    addToast({ symbol, timeframe, rsi: lastRsi, type: 'oversold' });
                }
            } else {
                currentStatus = 'neutral';
            }
            
            newAlertStatus[symbol] = currentStatus;
        });
        
        if (JSON.stringify(newAlertStatus) !== JSON.stringify(lastAlertedRsiStatus)) {
            setLastAlertedRsiStatus(newAlertStatus);
        }
        
    }, [symbolsData, areAlertsEnabled, timeframe, lastAlertedRsiStatus]);
    
    const handleResetSettings = useCallback(() => {
        localStorage.removeItem('crypto-all-symbols');
        localStorage.removeItem('crypto-user-symbols');
        localStorage.removeItem('crypto-favorites');
        localStorage.removeItem('crypto-alerts-enabled');
        
        setTheme('dark');
        setSettings(DARK_THEME_SETTINGS);
        setAllSymbols(DEFAULT_SYMBOLS);
        setUserSymbols(DEFAULT_SYMBOLS);
        setFavorites([]);
        setAreAlertsEnabled(false);
        setIsSettingsOpen(false);
    }, []);

    const handleTimeframeChange = useCallback((newTimeframe: Timeframe) => {
        setTimeframe(newTimeframe);
    }, []);
    
    const handleSaveAssetList = useCallback((data: { allSymbols: string[], selectedSymbols: string[] }) => {
        setAllSymbols(data.allSymbols);
        setUserSymbols(data.selectedSymbols);
        setFavorites(prev => prev.filter(fav => data.allSymbols.includes(fav)));
        setIsAssetModalOpen(false);
    }, []);

    const handleCellSizeChange = useCallback((newSize: number) => {
        setCellSize(newSize);
    }, []);

    const handleSelectSymbol = useCallback((symbol: string) => {
        setActiveSymbol(symbol);
    }, []);

    const handleCloseModal = useCallback(() => {
        setActiveSymbol(null);
    }, []);

    const handleSearchChange = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);
    
    const toggleFavorite = useCallback((symbol: string) => {
        setFavorites(prev =>
            prev.includes(symbol)
                ? prev.filter(s => s !== symbol)
                : [...prev, symbol]
        );
    }, []);
    
    const handleSettingsToggle = useCallback(() => {
        setIsSettingsOpen(isOpen => !isOpen);
    }, []);

    const handleShowFavoritesToggle = useCallback(() => {
        setShowFavoritesOnly(prev => !prev);
    }, []);

    const handleAlertsToggle = useCallback(() => {
        setAreAlertsEnabled(prev => !prev);
    }, []);

    const displayedSymbols = useMemo(() => {
        let symbols = userSymbols
            .filter(symbol => symbol.toLowerCase().includes(searchTerm.toLowerCase()));

        if (showFavoritesOnly) {
            symbols = symbols.filter(s => favorites.includes(s));
        }

        if (sortOrder !== 'default' && Object.keys(symbolsData).length > 0) {
            symbols.sort((a, b) => {
                const dataA = symbolsData[a];
                const dataB = symbolsData[b];
                const rsiA = dataA?.rsi?.[dataA.rsi.length - 1]?.value ?? (sortOrder === 'rsi-desc' ? -1 : 101);
                const rsiB = dataB?.rsi?.[dataB.rsi.length - 1]?.value ?? (sortOrder === 'rsi-desc' ? -1 : 101);
                return sortOrder === 'rsi-desc' ? rsiB - rsiA : rsiA - rsiB;
            });
        }
        
        return symbols;
    }, [searchTerm, showFavoritesOnly, favorites, sortOrder, symbolsData, userSymbols]);
    
    if (isInitializing) {
        return <SplashScreen />;
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-light-text font-sans flex flex-col">
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <div className="container mx-auto p-4 flex-grow">
                <CryptoHeader
                    theme={theme}
                    onThemeToggle={handleThemeToggle}
                    timeframe={timeframe}
                    onTimeframeChange={handleTimeframeChange}
                    onSettingsToggle={handleSettingsToggle}
                    timeframes={TIMEFRAMES}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                />
                <main className="pt-40 md:pt-24">
                     {/* Filters and Sorting */}
                    <div className="flex flex-wrap justify-end items-center gap-4 mb-4">
                        <label htmlFor="favorites-toggle" className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-medium-text-light dark:text-medium-text">Favorites Only</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="favorites-toggle"
                                    className="sr-only peer"
                                    checked={showFavoritesOnly}
                                    onChange={handleShowFavoritesToggle}
                                />
                                <div className="w-11 h-6 bg-light-border peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-dark-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary"></div>
                            </div>
                        </label>
                        <div className="flex items-center gap-1 bg-light-card dark:bg-dark-card p-1 rounded-lg border border-light-border dark:border-dark-border">
                            <button onClick={() => setSortOrder('rsi-desc')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${sortOrder === 'rsi-desc' ? 'bg-primary-light dark:bg-primary text-white dark:text-dark-bg' : 'hover:bg-light-border dark:hover:bg-dark-border'}`} aria-label="Sort RSI descending">RSI ↓</button>
                            <button onClick={() => setSortOrder('rsi-asc')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${sortOrder === 'rsi-asc' ? 'bg-primary-light dark:bg-primary text-white dark:text-dark-bg' : 'hover:bg-light-border dark:hover:bg-dark-border'}`} aria-label="Sort RSI ascending">RSI ↑</button>
                            <button onClick={() => setSortOrder('default')} className={`px-2 py-1 text-sm rounded-md transition ${sortOrder === 'default' ? 'text-primary-light dark:text-primary' : 'text-medium-text-light dark:text-medium-text hover:bg-light-border dark:hover:bg-dark-border'}`} aria-label="Reset sort">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                    <Grid
                        loading={loading}
                        symbols={displayedSymbols}
                        symbolsData={symbolsData}
                        onSelectSymbol={handleSelectSymbol}
                        cellSize={cellSize}
                        settings={settings}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                    />
                </main>
            </div>
            {activeSymbol && symbolsData[activeSymbol] && (
                <Modal
                    symbol={activeSymbol}
                    data={symbolsData[activeSymbol]}
                    onClose={handleCloseModal}
                    settings={settings}
                    timeframe={timeframe}
                />
            )}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onOpenAssetModal={() => setIsAssetModalOpen(true)}
                onOpenThemeModal={() => setIsThemeModalOpen(true)}
                areAlertsEnabled={areAlertsEnabled}
                onAlertsToggle={handleAlertsToggle}
                onReset={handleResetSettings}
                cellSize={cellSize}
                onCellSizeChange={handleCellSizeChange}
            />
            <AssetListModal
                isOpen={isAssetModalOpen}
                onClose={() => setIsAssetModalOpen(false)}
                onSave={handleSaveAssetList}
                allSymbols={allSymbols}
                currentSymbols={userSymbols}
            />
            <ThemeModal 
                isOpen={isThemeModalOpen}
                onClose={() => setIsThemeModalOpen(false)}
                settings={settings}
                onSettingsChange={setSettings}
            />
            <Footer />
        </div>
    );
};

export default App;