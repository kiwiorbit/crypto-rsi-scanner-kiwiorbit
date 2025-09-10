
import type { SymbolData, Timeframe, RsiDataPoint } from '../types';

const API_BASE_URL = 'https://api.binance.com/api/v3/klines';

const calculateRSI = (klines: any[][], length: number): RsiDataPoint[] => {
    const closes = klines.map((k: any[]) => parseFloat(k[4]));
    if (closes.length <= length) return [];

    const gains: number[] = [];
    const losses: number[] = [];
    for (let i = 1; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1];
        gains.push(Math.max(0, change));
        losses.push(Math.max(0, -change));
    }

    let avgGain = gains.slice(0, length).reduce((sum, val) => sum + val, 0) / length;
    let avgLoss = losses.slice(0, length).reduce((sum, val) => sum + val, 0) / length;

    const rsiValues: number[] = [];
    for (let i = length; i < gains.length; i++) {
        const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsiValues.push(rsi);

        avgGain = (avgGain * (length - 1) + gains[i]) / length;
        avgLoss = (avgLoss * (length - 1) + losses[i]) / length;
    }
    
    // The first RSI value corresponds to the candle at index `length + 1`.
    const relevantKlines = klines.slice(length + 1);

    return rsiValues.map((value, index) => ({
        time: relevantKlines[index][0], // Use the open time of the corresponding kline
        value: value,
    }));
};

const calculateSMA = (data: RsiDataPoint[], length: number): RsiDataPoint[] => {
    if (data.length < length) return [];

    const smaValues: RsiDataPoint[] = [];
    // Start from the point where a full `length` window is available
    for (let i = length - 1; i < data.length; i++) {
        const window = data.slice(i - length + 1, i + 1);
        const sum = window.reduce((acc, point) => acc + point.value, 0);
        smaValues.push({
            time: data[i].time,
            value: sum / length,
        });
    }
    return smaValues;
};


export const fetchRsiForSymbol = async (symbol: string, timeframe: Timeframe, limit: number = 80): Promise<SymbolData> => {
    try {
        const rsiPeriod = 14;
        const smaPeriod = 14;
        const url = `${API_BASE_URL}?symbol=${symbol}&interval=${timeframe}&limit=${limit + rsiPeriod + 1}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data for ${symbol}`);
        }
        const klines = await response.json();

        if (!klines || klines.length === 0) {
            return { rsi: [], sma: [], price: 0, volume: 0 };
        }

        const rsiData = calculateRSI(klines, rsiPeriod);
        const smaData = calculateSMA(rsiData, smaPeriod);
        const latestKline = klines[klines.length - 1];

        return {
            rsi: rsiData.slice(-limit),
            sma: smaData.slice(-limit),
            price: parseFloat(latestKline[4]),
            volume: parseFloat(latestKline[5]),
        };
    } catch (error) {
        // console.error(`Error fetching data for ${symbol}:`, error);
        return { rsi: [], sma: [], price: 0, volume: 0 }; // Return empty data on error
    }
};