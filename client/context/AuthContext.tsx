import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";
import { useRouter } from "expo-router";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface TokenPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🧠 Load saved credentials on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      const savedToken = await AsyncStorage.getItem("token");
      const savedUser = await AsyncStorage.getItem("user");

      if (savedToken && savedUser) {
        const decoded: TokenPayload = jwtDecode(savedToken);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (!isExpired) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          await logout(); // expired, force logout
        }
      }
      setLoading(false);
    };
    loadStoredAuth();
  }, []);

  // 🧩 Auto-refresh before token expiry
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (token) {
  //     const decoded: TokenPayload = jwtDecode(token);
  //     const expiresIn = decoded.exp * 1000 - Date.now();

  //     // refresh 2 mins before expiry
  //     const refreshTime = expiresIn - 2 * 60 * 1000;

  //     if (refreshTime > 0) {
  //       interval = setTimeout(async () => {
  //         await refreshToken();
  //       }, refreshTime);
  //     }
  //   }

  //   return () => clearTimeout(interval);
  // }, [token]);

  // // 🔄 Refresh token (re-login behind scenes)
  // const refreshToken = useCallback(async () => {
  //   try {
  //     if (!user?.email) return;
  //     const savedData = await AsyncStorage.getItem("user");
  //     const savedUser: User | null = savedData ? JSON.parse(savedData) : null;
  //     if (!savedUser) return;

  //     // simulate refresh (you can create a /refresh endpoint in backend later)
  //     const newToken = token;
  //     if (newToken) {
  //       await AsyncStorage.setItem("token", newToken);
  //       setToken(newToken);
  //     }
  //   } catch (err) {
  //     console.error("Token refresh failed:", err);
  //     await logout();
  //   }
  // }, [token, user]);

  const login = async (email: string, password: string) => {
    const { token, user } = await authService.login({ email, password });
    setToken(token);
    setUser(user);
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    router.push("/(tabs)"); // redirect to home after login
  };

  const register = async (fullName: string, email: string, password: string) => {
    const { token, user } = await authService.register({ fullName, email, password });
    setToken(token);
    setUser(user);
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    router.push("/(tabs)"); // redirect to home
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
    setToken(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
