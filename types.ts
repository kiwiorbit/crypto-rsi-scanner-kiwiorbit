
export interface Kline {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteAssetVolume: string;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: string;
    takerBuyQuoteAssetVolume:string;
    ignore: string;
}

export interface RsiDataPoint {
    time: number;
    value: number;
}

export interface SymbolData {
    rsi: RsiDataPoint[];
    sma: RsiDataPoint[];
    price: number;
    volume: number;
}

export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '8h' | '1d' | '3d' | '1w';

export interface Settings {
    bgColor: string;
    textColor: string;
    cellBgColor: string;
    rsiColor: string;
    smaColor: string;
    rsi50Color: string;
    lineWidth: number;
}

export type SortOrder = 'rsi-desc' | 'rsi-asc' | 'default';

export type DrawingTool = 'brush' | 'trendline';

export interface Drawing {
    tool: DrawingTool;
    points: { x: number; y: number }[];
    color: string;
    size: number;
}

export type Theme = 'light' | 'dark';
export type ViewMode = 'chart' | 'heatmap';

export interface Notification {
  id: number;
  symbol: string;
  timeframe: Timeframe;
  rsi: number;
  type: 'overbought' | 'oversold';
  read: boolean;
}