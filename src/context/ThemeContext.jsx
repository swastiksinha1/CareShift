import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('careshift-theme');
        // Default to light — only go dark if user explicitly chose it
        return savedTheme === 'dark';
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [isDark]);

    const toggleTheme = useCallback(() => {
        setIsDark(prev => {
            const next = !prev;
            localStorage.setItem('careshift-theme', next ? 'dark' : 'light');
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark: next } }));
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
