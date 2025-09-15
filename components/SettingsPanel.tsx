
import React from 'react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenAssetModal: () => void;
    onOpenThemeModal: () => void;
    onReset: () => void;
    areAlertsEnabled: boolean;
    onAlertsToggle: () => void;
    cellSize: number;
    onCellSizeChange: (size: number) => void;
    showColoredBorders: boolean;
    onColoredBordersToggle: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onClose,
    onOpenAssetModal,
    onOpenThemeModal,
    onReset,
    areAlertsEnabled,
    onAlertsToggle,
    cellSize,
    onCellSizeChange,
    showColoredBorders,
    onColoredBordersToggle,
}) => {
    
    if (!isOpen) {
        return null;
    }

    const handleResetClick = () => {
        if (window.confirm("Are you sure you want to reset all settings? This will restore the default theme, asset list, and clear favorites. This action cannot be undone.")) {
            onReset();
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300" onClick={onClose}></div>
            <div
                className={`fixed top-0 right-0 h-full bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-lg border-l border-light-border/50 dark:border-dark-border/50 text-dark-text dark:text-light-text shadow-2xl z-50 w-80 max-w-[90vw] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
                    <h3 className="text-2xl font-bold">Settings</h3>
                    <button onClick={onClose} className="text-2xl text-medium-text-light dark:text-medium-text hover:text-dark-text dark:hover:text-light-text transition-colors" aria-label="Close settings">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                {/* Main Content (menu) */}
                <div className="flex-grow p-4 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Customization Section */}
                    <div>
                        <h4 className="px-3 pb-2 font-semibold text-medium-text-light dark:text-medium-text uppercase tracking-wider text-sm">Customization</h4>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => { onOpenAssetModal(); onClose(); }}
                                    className="w-full text-left p-3 rounded-lg bg-light-bg/80 dark:bg-dark-bg/80 hover:bg-light-border dark:hover:bg-dark-border transition-colors flex items-center gap-4"
                                >
                                    <i className="fa-solid fa-list-check w-5 text-center text-lg text-primary-light dark:text-primary"></i>
                                    <span className="font-semibold">Asset List</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => { onOpenThemeModal(); onClose(); }}
                                    className="w-full text-left p-3 rounded-lg bg-light-bg/80 dark:bg-dark-bg/80 hover:bg-light-border dark:hover:bg-dark-border transition-colors flex items-center gap-4"
                                >
                                    <i className="fa-solid fa-palette w-5 text-center text-lg text-primary-light dark:text-primary"></i>
                                    <span className="font-semibold">Theme & Appearance</span>
                                </button>
                            </li>
                             <li className="p-3 rounded-lg bg-light-bg/80 dark:bg-dark-bg/80">
                                <label htmlFor="cellSizeSlider" className="block mb-2 font-semibold text-dark-text dark:text-light-text">Grid Cell Size: <span className="font-mono text-primary-light dark:text-primary">{cellSize}px</span></label>
                                <input
                                    type="range"
                                    id="cellSizeSlider"
                                    min="80"
                                    max="250"
                                    value={cellSize}
                                    onChange={(e) => onCellSizeChange(Number(e.target.value))}
                                    className="w-full accent-primary-light dark:accent-primary h-2 bg-light-border dark:bg-dark-border rounded-lg outline-none transition"
                                />
                            </li>
                            <li className="p-3 rounded-lg bg-light-bg/80 dark:bg-dark-bg/80 flex items-center justify-between">
                                <label htmlFor="colored-borders-toggle" className="font-semibold cursor-pointer pr-4 text-dark-text dark:text-light-text flex-grow">
                                    Colored Cell Borders
                                    <span className="block text-xs font-normal text-medium-text-light dark:text-medium-text">Apply heatmap colors to chart view borders.</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        id="colored-borders-toggle"
                                        className="sr-only peer"
                                        checked={showColoredBorders}
                                        onChange={onColoredBordersToggle}
                                    />
                                    <div className="w-11 h-6 bg-light-border peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-dark-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary"></div>
                                </div>
                            </li>
                        </ul>
                    </div>
                     {/* Alerts Section */}
                     <div>
                        <h4 className="px-3 pb-2 font-semibold text-medium-text-light dark:text-medium-text uppercase tracking-wider text-sm">Alerts</h4>
                        <div className="p-3 rounded-lg bg-light-bg/80 dark:bg-dark-bg/80 flex items-center justify-between">
                            <label htmlFor="alerts-toggle" className="font-semibold cursor-pointer pr-4 text-dark-text dark:text-light-text flex-grow">
                                Enable RSI Alerts
                            </label>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="alerts-toggle"
                                    className="sr-only peer"
                                    checked={areAlertsEnabled}
                                    onChange={onAlertsToggle}
                                />
                                <div className="w-11 h-6 bg-light-border peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-dark-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary"></div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Footer (Reset button) */}
                <div className="p-4 mt-auto border-t border-light-border dark:border-dark-border">
                    <button
                        onClick={handleResetClick}
                        className="w-full p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors flex items-center gap-4"
                    >
                         <i className="fa-solid fa-arrow-rotate-left w-5 text-center text-lg"></i>
                         <span className="font-semibold">Reset to Defaults</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default SettingsPanel;
