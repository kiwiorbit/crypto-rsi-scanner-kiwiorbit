
import React from 'react';
import type { SymbolData } from '../types';
import { getRsiColorInfo } from '../constants';

interface HeatmapCellProps {
    symbol: string;
    data: SymbolData;
    onSelect: (symbol: string) => void;
    isFavorite: boolean;
    onToggleFavorite: (symbol: string) => void;
}

const HeatmapCell: React.FC<HeatmapCellProps> = ({ symbol, data, onSelect, isFavorite, onToggleFavorite }) => {
    const lastRsi = data?.rsi?.[data.rsi.length - 1]?.value;
    
    const { bgColor, textColor, isExtreme } = getRsiColorInfo(lastRsi);
    const animationClasses = isExtreme ? 'font-bold animate-pulse-fast' : '';
    const colorClasses = `${bgColor} ${textColor} ${animationClasses}`;

    const handleSelect = () => onSelect(symbol);

    const handleToggleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite(symbol);
    };

    return (
        <div
            className={`group relative flex flex-col justify-between p-3 rounded-lg cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 hover:z-10 hover:shadow-2xl ${colorClasses}`}
            onClick={handleSelect}
            style={{ height: '70px' }}
        >
            <div className="flex justify-between items-start">
                <span className="font-bold text-sm tracking-tight">{symbol}</span>
                <button
                    onClick={handleToggleFavoriteClick}
                    className="z-10 text-base transition-colors"
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <i className={`${isFavorite ? 'fa-solid text-yellow-400' : 'fa-regular'} fa-star opacity-70 group-hover:opacity-100 transition-opacity`}></i>
                </button>
            </div>
            <div className="text-right">
                <span className="font-mono font-semibold text-lg">
                    {lastRsi ? lastRsi.toFixed(2) : 'N/A'}
                </span>
            </div>
        </div>
    );
};

export default React.memo(HeatmapCell);
