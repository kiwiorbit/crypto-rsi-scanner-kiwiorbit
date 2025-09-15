

import React from 'react';
import type { Notification } from '../types';

interface NotificationItemProps {
    notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    const isOverbought = notification.type === 'overbought';
    const accentColor = isOverbought ? 'border-red-500' : 'border-green-500';
    const icon = isOverbought ? 'fa-arrow-trend-up text-red-500' : 'fa-arrow-trend-down text-green-500';

    return (
        <div className={`p-3 border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors`}>
            <div className="flex items-start gap-3">
                <i className={`fa-solid ${icon} text-lg mt-1`}></i>
                <div>
                    <p className="font-bold text-sm text-dark-text dark:text-light-text">{notification.symbol} ({notification.timeframe})</p>
                    <p className="text-xs text-medium-text-light dark:text-medium-text">
                        {isOverbought ? 'Overbought' : 'Oversold'} at {notification.rsi.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

interface NotificationPanelProps {
    isOpen: boolean;
    notifications: Notification[];
    onClear: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, notifications, onClear }) => {
    if (!isOpen) return null;

    return (
        <div
            className="absolute top-full mt-2 w-60 max-w-[calc(100vw-2rem)] bg-light-bg dark:bg-dark-bg backdrop-blur-lg border border-light-border/50 dark:border-dark-border/50 rounded-xl shadow-2xl z-50 animate-dropdown-in flex flex-col overflow-hidden md:right-0 left-1/2 -translate-x-[65%] md:left-auto md:translate-x-0 origin-top md:origin-top-right"
        >
            <div className="flex justify-between items-center p-3 border-b border-light-border dark:border-dark-border">
                <h3 className="font-bold text-dark-text dark:text-light-text">Notifications</h3>
                {notifications.length > 0 && (
                     <button onClick={onClear} className="text-xs font-semibold text-primary-light dark:text-primary hover:underline focus:outline-none">
                        Clear All
                    </button>
                )}
            </div>
            <div className="flex-grow max-h-[60vh] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="text-center p-8 text-sm text-medium-text-light dark:text-medium-text">
                        <i className="fa-solid fa-bell-slash text-4xl mb-4 opacity-70"></i>
                        <p>No new notifications.</p>
                    </div>
                ) : (
                    <div>
                        {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
