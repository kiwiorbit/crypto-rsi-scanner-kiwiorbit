import React from 'react';
import type { DrawingTool } from '../types';

interface DrawingToolbarProps {
    activeTool: DrawingTool;
    onToolChange: (tool: DrawingTool) => void;
    brushColor: string;
    onColorChange: (color: string) => void;
    onClear: () => void;
    textColor: string;
}

const ToolButton: React.FC<{
    icon: string;
    tool: DrawingTool;
    activeTool: DrawingTool;
    onClick: (tool: DrawingTool) => void;
    label: string;
}> = ({ icon, tool, activeTool, onClick, label }) => (
    <button
        onClick={() => onClick(tool)}
        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors text-lg ${
            activeTool === tool
                ? 'bg-primary-light/20 dark:bg-primary/20 text-primary-light dark:text-primary'
                : 'text-medium-text-light dark:text-medium-text hover:bg-light-border dark:hover:bg-dark-border'
        }`}
        aria-label={label}
        title={label}
    >
        <i className={`fa-solid ${icon}`}></i>
    </button>
);

const ActionButton: React.FC<{
    icon: string;
    onClick: () => void;
    disabled?: boolean;
    label: string;
}> = ({ icon, onClick, disabled = false, label }) => (
     <button
        onClick={onClick}
        disabled={disabled}
        className="w-9 h-9 flex items-center justify-center rounded-md transition-colors text-lg text-medium-text-light dark:text-medium-text hover:bg-light-border dark:hover:bg-dark-border disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={label}
        title={label}
    >
        <i className={`fa-solid ${icon}`}></i>
    </button>
);

const ColorButton: React.FC<{
    color: string;
    activeColor: string;
    onClick: (color: string) => void;
}> = ({ color, activeColor, onClick }) => (
    <button
        onClick={() => onClick(color)}
        className={`w-7 h-7 rounded-full transition-transform transform hover:scale-110 border-2 ${
            activeColor === color ? 'ring-2 ring-inset ring-primary border-transparent' : 'border-light-border dark:border-dark-border'
        }`}
        style={{ backgroundColor: color }}
        aria-label={`Select color ${color}`}
    />
);

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
    activeTool,
    onToolChange,
    brushColor,
    onColorChange,
    onClear,
    textColor
}) => {
    const drawingColors = [textColor, '#A855F7', '#EAB308', '#F97316'];
    
    return (
        <div className="px-4 py-2 border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50 flex flex-wrap items-center gap-4">
            {/* Tools */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border">
                <ToolButton icon="fa-pencil" tool="brush" activeTool={activeTool} onClick={onToolChange} label="Brush Tool" />
                <ToolButton icon="fa-arrow-up-right-dots" tool="trendline" activeTool={activeTool} onClick={onToolChange} label="Trendline Tool" />
            </div>

            {/* Properties */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    {drawingColors.map(color => (
                        <ColorButton 
                            key={color} 
                            color={color} 
                            activeColor={brushColor} 
                            onClick={onColorChange} 
                        />
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-light-border dark:bg-dark-border"></div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <ActionButton icon="fa-trash-can" onClick={onClear} label="Clear All Drawings" />
            </div>
        </div>
    );
};

export default DrawingToolbar;