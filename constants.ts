
import type { Timeframe, Settings } from './types';

// Original list with duplicates
const RAW_SYMBOLS: string[] = [
    'BTCUSDT',
    'ETHUSDT',
    'PAXGUSDT',
    'SOLUSDT',
    'WLDUSDT',
    'DOGEUSDT',
    'BNBUSDT',
    'XRPUSDT',
    'LINEAUSDT',
    'ENAUSDT',
    'AVAXUSDT',
    'SOMIUSDT',
    'OPENUSDT',
    'WLFIUSDT',
    'SUIUSDT',
    'ADAUSDT',
    'TRXUSDT',
    'LINKUSDT',
    'ARBUSDT',
    'ONDOUSDT',
    'PYTHUSDT',
    'ATOMUSDT',
    'FILUSDT',
    'XLMUSDT',
    'BCHUSDT',
    'ETCUSDT',
    'VIRTUALUSDT',
    'SEIUSDT',
    'DOTUSDT',
    'AAVEUSDT',
    'UNIUSDT',
    'NEARUSDT',
    'TAOUSDT',
    'HBARUSDT',
    'TIAUSDT',
    'ETHFIUSDT',
    'BBUSDT',
    'FETUSDT',
    'APTUSDT',
    'LDOUSDT',
    'TONUSDT',
    'RAYUSDT',
    'INJUSDT',
    'PENDLEUSDT',
    'BIOUSDT',
    'RENDERUSDT',
    'CGPTUSDT',
    'CFXUSDT',
    'MAVUSDT',
    'JUPUSDT',
    'BERAUSDT',
    'MKRUSDT',
    'GALAUSDT',
    'GRTUSDT',
    'ALGOUSDT',
    'ROSEUSDT',
    'AIXBTUSDT',
    'ENSUSDT',
    'VETUSDT',
    'RUNEUSDT',
    'BLURUSDT',
    'STRKUSDT',
    'PORTALUSDT',
    'PIXELUSDT',
    'SAHARAUSDT',
    'STXUSDT',
    'ZROUSDT',
    'IQUSDT',
    'QNTUSDT',
    'NEOUSDT',
    'AXSUSDT',
    'HYPERUSDT',
    'RSRUSDT',
    'SAGAUSDT',
    'MOVEUSDT',
    'SANDUSDT',
    'YGGUSDT',
    'JTOUSDT',
    'XAIUSDT',
    'API3USDT',
    'FIOUSDT',
    'IOTAUSDT',
    'TRBUSDT',
    'KMNOUSDT',
    'BEAMXUSDT',
    'THETAUSDT',
    'CHZUSDT',
    'ZECUSDT',
    'MANAUSDT',
    'FXSUSDT',
    'DYMUSDT',
    'SUPERUSDT',
    'SYSUSDT',
    'SUSHIUSDT',
    'BATUSDT',
    'CTSIUSDT',
    'RAREUSDT',
    'FIDAUSDT',
    'VANRYUSDT',
    'WUSDT',
    'EGLDUSDT',
    'REZUSDT',
    'PHAUSDT',
    'SYNUSDT',
    'CHRUSDT',
    'AUCTIONUSDT',
    'SNXUSDT',
    'EDUUSDT',
    'TNSRUSDT',
    'XVGUSDT',
    'GASUSDT',
    'BICOUSDT',
    'SOLETH',
    'ETHBTC',
    'AVAXETH',
    'LINKETH',
    'XRPETH',
    'DOGEBTC',
    'ADAETH',
    'BNBETH',
    'TRXETH',
    'TRXXRP',
    'SUIBTC',
    'OGUSDT',
    'ONDOUSDT',
    'KAITOUSDT',
    'CRVUSDT'
];


// Exporting a unique, default list of symbols. This is the fallback.
export const DEFAULT_SYMBOLS: string[] = [...new Set(RAW_SYMBOLS)];


export const TIMEFRAMES: { value: Timeframe; label: string }[] = [
    { value: '1m', label: '1m' },
    { value: '3m', label: '3m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '30m', label: '30m' },
    { value: '1h', label: '1h' },
    { value: '2h', label: '2h' },
    { value: '4h', label: '4h' },
    { value: '8h', label: '8h' },
    { value: '1d', label: '1d' },
    { value: '3d', label: '3d' },
    { value: '1w', label: '1w' },
];

export const DARK_THEME_SETTINGS: Settings = {
    bgColor: '#181c24',
    textColor: '#e5e9f2',
    cellBgColor: '#232a36',
    rsiColor: '#29ffb8',
    smaColor: '#4ec3fa',
    rsi50Color: '#4a5568',
    lineWidth: 2,
};

export const LIGHT_THEME_SETTINGS: Settings = {
    bgColor: '#f0f2f5',
    textColor: '#181c24',
    cellBgColor: '#ffffff',
    rsiColor: '#00a878',
    smaColor: '#0077b6',
    rsi50Color: '#b0b8c9',
    lineWidth: 2,
};

export interface RsiColorInfo {
    bgColor: string;
    textColor: string;
    isExtreme: boolean;
}

export const getRsiColorInfo = (rsi: number | undefined): RsiColorInfo => {
    if (rsi === undefined || rsi === null) return { bgColor: 'bg-gray-200 dark:bg-gray-700', textColor: 'text-gray-400', isExtreme: false };

    const whiteText = 'text-white/95';
    const darkText = 'text-black';

    // Extreme Oversold & Oversold
    if (rsi < 20) return { bgColor: 'bg-green-900', textColor: whiteText, isExtreme: true };
    if (rsi < 30) return { bgColor: 'bg-green-700', textColor: whiteText, isExtreme: false };
    if (rsi < 45) return { bgColor: 'bg-green-500', textColor: darkText, isExtreme: false };

    // Mid-range
    if (rsi < 50) return { bgColor: 'bg-green-400', textColor: darkText, isExtreme: false };   // 45-49.99
    if (rsi < 51) return { bgColor: 'bg-purple-400', textColor: darkText, isExtreme: false };    // 50-50.99
    if (rsi < 55) return { bgColor: 'bg-yellow-400', textColor: darkText, isExtreme: true };  // 51-54.99

    // Overbought
    if (rsi < 65) return { bgColor: 'bg-amber-600', textColor: whiteText, isExtreme: false };   // 55-64.99
    if (rsi < 75) return { bgColor: 'bg-rose-500', textColor: whiteText, isExtreme: false };  // 65-74.99
    if (rsi <= 80) return { bgColor: 'bg-rose-700', textColor: whiteText, isExtreme: false };    // 75-80.00

    // Extreme Overbought (rsi > 80)
    return { bgColor: 'bg-rose-900', textColor: whiteText, isExtreme: true };
};
