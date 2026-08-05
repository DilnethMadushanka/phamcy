import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('dark');
    body.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    body.setAttribute('data-theme', 'light');
    try {
      localStorage.removeItem('pharmacare_theme');
    } catch (e) {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {}, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return { theme: 'light', toggleTheme: () => {}, isDark: false };
};
