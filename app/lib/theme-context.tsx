import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'pink' | 'blue' | 'green' | 'purple' | 'yellow';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState<ThemeColor>('pink');
  
  // 로컬 스토리지에서 테마 불러오기
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeColor') as ThemeColor | null;
    if (savedTheme) {
      setThemeColor(savedTheme);
    }
  }, []);
  
  // 테마 변경 시 로컬 스토리지에 저장
  const handleSetThemeColor = (color: ThemeColor) => {
    setThemeColor(color);
    localStorage.setItem('themeColor', color);
    
    // body 클래스 업데이트
    document.body.classList.remove('bg-theme-pink', 'bg-theme-blue', 'bg-theme-green', 'bg-theme-purple', 'bg-theme-yellow');
    document.body.classList.add(`bg-theme-${color}`);
  };
  
  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor: handleSetThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 