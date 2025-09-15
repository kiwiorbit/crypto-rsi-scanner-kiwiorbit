
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CryptoHeader from './components/CryptoHeader';
import Grid from './components/Grid';
import Heatmap from './components/Heatmap';
import Modal from './components/Modal';
import SettingsPanel from './components/SettingsPanel';
import Footer from './components/Footer';
import AssetListModal from './components/AssetListModal';
import ThemeModal from './components/ThemeModal';
import { DEFAULT_SYMBOLS, TIMEFRAMES, LIGHT_THEME_SETTINGS, DARK_THEME_SETTINGS } from './constants';
import type { Settings, SymbolData, Timeframe, Theme, Notification, SortOrder, ViewMode } from './types';
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
  toast: Notification;
  onRemove: (id: number) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const onRemoveRef = useRef(onRemove);

    // Keep the onRemove function reference up-to-date
    useEffect(() => {
        onRemoveRef.current = onRemove;
    }, [onRemove]);

    useEffect(() => {
        // Trigger entrance animation
        const enter = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        // Set timer to automatically dismiss the toast
        const timer = setTimeout(() => {
            setIsVisible(false); // Trigger exit animation
            // Use the ref to ensure the latest onRemove function is called
            setTimeout(() => onRemoveRef.current(toast.id), 500); 
        }, 10000); // 10 second duration

        return () => {
            cancelAnimationFrame(enter);
            clearTimeout(timer);
        };
    }, [toast.id]); // Dependency only on toast.id to prevent timer reset

    const handleClose = () => {
        setIsVisible(false); // Trigger exit animation
        // Use the ref to ensure the latest onRemove function is called
        setTimeout(() => onRemoveRef.current(toast.id), 500);
    };
  
  const isOverbought = toast.type === 'overbought';
  const accentColor = isOverbought ? 'bg-red-500' : 'bg-green-500';
  const icon = isOverbought ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
  const title = `${toast.symbol} (${toast.timeframe})`;
  const body = `is now ${isOverbought ? 'Overbought' : 'Oversold'} at ${toast.rsi.toFixed(2)}`;

  return (
    <div
      className={`transform transition-all duration-500 ease-in-out relative w-full max-w-xs p-4 overflow-hidden rounded-xl shadow-2xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-dark-text dark:text-light-text ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
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
  toasts: Notification[];
  onRemove: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs space-y-3">
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
    const [symbolsData, setSymbolsData] = useState<Record<string, SymbolData>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('chart');
    
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
            return saved ? JSON.parse(saved) : true; // Default to true
        } catch {
            return true;
        }
    });
    
    // Colored Borders State
    const [showColoredBorders, setShowColoredBorders] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('crypto-colored-borders-enabled');
            return saved ? JSON.parse(saved) : false; // Default to false
        } catch {
            return false;
        }
    });

    const [lastAlertedRsiStatus, setLastAlertedRsiStatus] = useState<Record<string, 'overbought' | 'oversold' | 'neutral'>>({});
    const [liveToasts, setLiveToasts] = useState<Notification[]>([]);
    
    // Persistent notifications for the panel
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        try {
            const saved = localStorage.getItem('crypto-notifications');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to parse notifications from localStorage", error);
            return [];
        }
    });

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

    useEffect(() => {
        localStorage.setItem('crypto-colored-borders-enabled', JSON.stringify(showColoredBorders));
    }, [showColoredBorders]);

     useEffect(() => {
        localStorage.setItem('crypto-notifications', JSON.stringify(notifications));
    }, [notifications]);

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

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
        const newNotification = { ...notification, id: Date.now() + Math.random(), read: false };

        // Add to persistent list for the panel (newest first)
        setNotifications(prev => [newNotification, ...prev].slice(0, 25)); // Limit history to 25

        // Add to live toasts for the pop-up (newest first)
        setLiveToasts(prev => [newNotification, ...prev].slice(0, 5)); // Limit on-screen toasts
    }, []);

    const removeLiveToast = useCallback((id: number) => {
        setLiveToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const markNotificationsAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // This effect handles sending notifications when data changes
    useEffect(() => {
        const ALLOWED_TIMEFRAMES_FOR_ALERTS: Timeframe[] = ['5m', '15m', '30m', '1h', '2h', '4h', '8h', '1d', '3d', '1w'];
        
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
            const alertKey = `${symbol}-${timeframe}`;
            const previousStatus = lastAlertedRsiStatus[alertKey] || 'neutral';
            let currentStatus: 'overbought' | 'oversold' | 'neutral' = 'neutral';
            
            if (lastRsi >= overboughtThreshold) {
                currentStatus = 'overbought';
                if (previousStatus !== 'overbought') {
                    addNotification({ symbol, timeframe, rsi: lastRsi, type: 'overbought' });
                }
            } else if (lastRsi <= oversoldThreshold) {
                currentStatus = 'oversold';
                if (previousStatus !== 'oversold') {
                    addNotification({ symbol, timeframe, rsi: lastRsi, type: 'oversold' });
                }
            } else {
                currentStatus = 'neutral';
            }
            
            newAlertStatus[alertKey] = currentStatus;
        });
        
        if (JSON.stringify(newAlertStatus) !== JSON.stringify(lastAlertedRsiStatus)) {
            setLastAlertedRsiStatus(newAlertStatus);
        }
        
    }, [symbolsData, areAlertsEnabled, timeframe, lastAlertedRsiStatus, addNotification]);
    
    const handleResetSettings = useCallback(() => {
        localStorage.removeItem('crypto-all-symbols');
        localStorage.removeItem('crypto-user-symbols');
        localStorage.removeItem('crypto-favorites');
        localStorage.removeItem('crypto-alerts-enabled');
        localStorage.removeItem('crypto-colored-borders-enabled');
        localStorage.removeItem('crypto-notifications');
        
        setTheme('dark');
        setSettings(DARK_THEME_SETTINGS);
        setAllSymbols(DEFAULT_SYMBOLS);
        setUserSymbols(DEFAULT_SYMBOLS);
        setFavorites([]);
        setAreAlertsEnabled(true);
        setShowColoredBorders(false);
        setNotifications([]);
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

    const handleColoredBordersToggle = useCallback(() => {
        setShowColoredBorders(prev => !prev);
    }, []);
    
    const handleSortChange = useCallback(() => {
        setSortOrder(currentOrder => {
            if (currentOrder === 'default') {
                return 'rsi-asc';
            } else if (currentOrder === 'rsi-asc') {
                return 'rsi-desc';
            } else {
                return 'default';
            }
        });
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

    const getSortButtonContent = () => {
        switch (sortOrder) {
            case 'rsi-asc':
                return <>RSI <i className="fa-solid fa-arrow-up text-xs"></i></>;
            case 'rsi-desc':
                return <>RSI <i className="fa-solid fa-arrow-down text-xs"></i></>;
            default:
                return <>Sort by RSI</>;
        }
    };
    const isSortActive = sortOrder !== 'default';

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-light-text font-sans flex flex-col">
            <ToastContainer toasts={liveToasts} onRemove={removeLiveToast} />
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
                    notifications={notifications}
                    onClearNotifications={clearNotifications}
                    onMarkNotificationsRead={markNotificationsAsRead}
                />
                <main className="pt-40 md:pt-24">
                     {/* Filters and Sorting */}
                    <div className="flex flex-wrap justify-end items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 bg-light-card dark:bg-dark-card p-1 rounded-lg border border-light-border dark:border-dark-border">
                            <button onClick={() => setViewMode('chart')} className={`px-3 py-2 text-sm rounded-md transition ${viewMode === 'chart' ? 'bg-primary-light dark:bg-primary text-white dark:text-dark-bg' : 'text-medium-text-light dark:text-medium-text hover:bg-light-border dark:hover:bg-dark-border'}`} aria-label="Chart View" title="Chart View">
                                <i className="fa-solid fa-chart-line"></i>
                            </button>
                            <button onClick={() => setViewMode('heatmap')} className={`px-3 py-2 text-sm rounded-md transition ${viewMode === 'heatmap' ? 'bg-primary-light dark:bg-primary text-white dark:text-dark-bg' : 'text-medium-text-light dark:text-medium-text hover:bg-light-border dark:hover:bg-dark-border'}`} aria-label="Heatmap View" title="Heatmap View">
                                <i className="fa-solid fa-table-cells"></i>
                            </button>
                        </div>
                        <button
                            onClick={handleShowFavoritesToggle}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 border ${
                                showFavoritesOnly 
                                ? 'bg-primary-light dark:bg-primary text-white dark:text-dark-bg border-transparent' 
                                : 'bg-light-card dark:bg-dark-card text-medium-text-light dark:text-medium-text border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border'
                            }`}
                            aria-pressed={showFavoritesOnly}
                            aria-label="Toggle favorites filter"
                        >
                            <i className={`fa-star ${showFavoritesOnly ? 'fa-solid' : 'fa-regular'}`}></i>
                            <span>Favorites</span>
                        </button>
                        <button
                            onClick={handleSortChange}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 border ${
                                isSortActive 
                                ? 'bg-primary-light dark:bg-primary text-white dark:text-dark-bg border-transparent' 
                                : 'bg-light-card dark:bg-dark-card text-medium-text-light dark:text-medium-text border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border'
                            }`}
                            aria-label="Cycle RSI sort order"
                        >
                            {getSortButtonContent()}
                        </button>
                    </div>
                    {viewMode === 'chart' ? (
                        <Grid
                            loading={loading}
                            symbols={displayedSymbols}
                            symbolsData={symbolsData}
                            onSelectSymbol={handleSelectSymbol}
                            settings={settings}
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                            showColoredBorders={showColoredBorders}
                        />
                    ) : (
                        <Heatmap
                            loading={loading}
                            symbols={displayedSymbols}
                            symbolsData={symbolsData}
                            onSelectSymbol={handleSelectSymbol}
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                        />
                    )}
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
                showColoredBorders={showColoredBorders}
                onColoredBordersToggle={handleColoredBordersToggle}
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
