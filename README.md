# Crypto RSI Scanner

A responsive web application designed to visualize the Relative Strength Index (RSI) for various cryptocurrency trading pairs from the Binance Futures market across different timeframes. This dashboard helps traders spot opportunities with a powerful, customizable interface.

## Features

-   **Real-time Data:** Fetches and displays up-to-date RSI & SMA data from the Binance API.
-   **Customizable Grid:** A dynamic grid layout that allows users to monitor multiple trading pairs simultaneously. The size of the grid cells can be adjusted for better visibility.
-   **Favorites & Sorting:** Star your favorite symbols for quick access and sort the entire grid by RSI value (high-to-low or low-to-high).
-   **Multiple Timeframes:** Easily switch between various timeframes, from 1 minute to 1 week, to analyze RSI trends.
-   **Detailed Chart View:** Click on any symbol to open a detailed modal view with a historical RSI chart, including a 14-period SMA, overbought, oversold, and midline indicators.
-   **Theming:** Supports both light and dark modes to suit user preference. The theme and specific chart colors are fully customizable through a settings panel.
-   **Search Functionality:** Quickly find specific trading pairs using the built-in search feature.
-   **Responsive Design:** The interface is optimized for various screen sizes, from mobile devices to desktops.

## Tech Stack

-   **Frontend:** React, TypeScript
-   **Styling:** Tailwind CSS
-   **Charting:** Recharts
-   **Data Source:** Binance Public API