import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const ADMIN_CREDENTIALS = { email: "admin@inventorypro.com", password: "admin123" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ip_user")) || null; }
    catch { return null; }
  });

  const login = (email, password) => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const userData = { name: "Admin User", email, role: "Administrator" };
      localStorage.setItem("ip_user", JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("ip_user");
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem("ip_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
