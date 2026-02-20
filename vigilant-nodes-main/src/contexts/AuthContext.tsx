import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (method: "google" | "email", email?: string) => void;
  logout: () => void;
}

const mockUser: User = {
  id: "usr_001",
  name: "Rahul Sharma",
  email: "rahul.sharma@gmail.com",
  avatar: "",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("muledetect-auth");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (method: "google" | "email", email?: string) => {
    const u = { ...mockUser, email: email || mockUser.email };
    setUser(u);
    localStorage.setItem("muledetect-auth", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("muledetect-auth");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
