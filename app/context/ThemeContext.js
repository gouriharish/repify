import React, { createContext, useContext, useState, useRef, useMemo } from "react";
import { Animated } from "react-native";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(true); // Default to dark
  const anim = useRef(new Animated.Value(1)).current; // Default to 1 for dark

  const toggleTheme = () => {
    const toValue = dark ? 0 : 1;
    Animated.timing(anim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setDark(!dark);
  };

  // We wrap COLORS in useMemo so that any component using useTheme() 
  // gets the new colors immediately when 'dark' changes.
  const COLORS = useMemo(() => ({
    bg: dark ? "#020617" : "#F8FAFC",
    card: dark ? "#0F172A" : "#FFFFFF",
    primary: dark ? "#38BDF8" : "#0284C7",
    accent: dark ? "#22A3FF" : "#22A3FF",
    text: dark ? "#F8FAFC" : "#0F172A",
    muted: dark ? "#94A3B8" : "#64748B",
    border: dark ? "#1E293B" : "#E2E8F0"
  }), [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme, anim, COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);