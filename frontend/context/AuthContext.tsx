import { useContext, createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Text, SafeAreaView, Alert } from "react-native";
import axios from "axios";

type AuthContextType = {
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isLoading: true
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("access_token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.log("Error loading token", e);
        Alert.alert("Error", "Could not load token");
        await SecureStore.deleteItemAsync("access_token");
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      const response = await axios.post(
        `http://10.0.2.2:8000/auth/login`,
        params.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const {access_token} = response.data;
      await SecureStore.setItemAsync("access_token", access_token);
      setToken(access_token);
      return true;
    } catch (error: unknown) {
      let message = "Unknown error";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.detail || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert("Login Failed", message);
      return false;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    setToken(null);
  };

  const isAuthenticated = !!token;
  console.log('isAuthenticated: ' + isAuthenticated);
  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated, isLoading}}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};



export { useAuth, AuthContext, AuthProvider };
