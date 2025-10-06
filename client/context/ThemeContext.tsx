import React, { createContext, useState, ReactNode } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { Colors } from "../constants/theme";

interface ThemeContextType {
  colorScheme: ColorSchemeName;
  setColorScheme: React.Dispatch<React.SetStateAction<ColorSchemeName>>;
  theme: typeof Colors.light | typeof Colors.dark;
}

export const ThemeContext = createContext<ThemeContextType>({
  colorScheme: "light",
  setColorScheme: () => {},
  theme: Colors.light,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() || "light"
  );

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
