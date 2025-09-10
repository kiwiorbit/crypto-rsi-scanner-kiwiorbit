import React from 'react';
import type { Settings } from '../types';

interface ThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {

    const handleSettingChange = (key: keyof Settings, value: string | number) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-dark-bg/80 dark:bg-dark-bg/90 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-light-border/50 dark:border-dark-border/50">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-xl font-bold text-dark-text dark:text-light-text">Theme & Appearance</h2>
                    <button onClick={onClose} className="text-2xl text-medium-text-light dark:text-medium-text hover:text-dark-text dark:hover:text-light-text transition-colors" aria-label="Close theme settings">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto">
                    <SettingInput
                        label="Background Color"
                        type="color"
                        value={settings.bgColor}
                        onChange={(e) => handleSettingChange('bgColor', e.target.value)}
                    />
                    <SettingInput
                        label="Text Color"
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => handleSettingChange('textColor', e.target.value)}
                    />
                    <SettingInput
                        label="Grid Cell Background"
                        type="color"
                        value={settings.cellBgColor}
                        onChange={(e) => handleSettingChange('cellBgColor', e.target.value)}
                    />
                    <SettingInput
                        label="RSI Line Color"
                        type="color"
                        value={settings.rsiColor}
                        onChange={(e) => handleSettingChange('rsiColor', e.target.value)}
                    />
                    <SettingInput
                        label="SMA Line Color"
                        type="color"
                        value={settings.smaColor}
                        onChange={(e) => handleSettingChange('smaColor', e.target.value)}
                    />
                    <SettingInput
                        label="50 RSI Line Color"
                        type="color"
                        value={settings.rsi50Color}
                        onChange={(e) => handleSettingChange('rsi50Color', e.target.value)}
                    />
                    <div className="flex flex-col pt-2">
                        <label className="block mb-2 font-semibold text-dark-text dark:text-light-text">Line Width: <span className="font-mono text-primary">{settings.lineWidth}</span></label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="0.5"
                            value={settings.lineWidth}
                            onChange={(e) => handleSettingChange('lineWidth', Number(e.target.value))}
                            className="w-full accent-primary h-2 bg-light-border dark:bg-dark-border rounded-lg outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SettingInputProps {
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingInput: React.FC<SettingInputProps> = ({ label, type, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="font-semibold text-dark-text dark:text-light-text">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className="w-10 h-10 p-1 bg-transparent border border-light-border dark:border-dark-border rounded-md cursor-pointer"
        />
    </div>
);

export default ThemeModal;