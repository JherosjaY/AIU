import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate session from sessionStorage on initial load
  useEffect(() => {
    const storedSession = sessionStorage.getItem('aiu_session');
    if (storedSession) {
      try {
        setUser(JSON.parse(storedSession));
      } catch (e) {
        console.warn("Session hydration failed:", e);
        sessionStorage.removeItem('aiu_session');
      }
    }
    setLoading(false);
  }, []);

  const login = (role, authId, token) => {
    const sessionData = { role, authId, token, timestamp: new Date().toISOString() };
    setUser(sessionData);
    sessionStorage.setItem('aiu_session', JSON.stringify(sessionData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('aiu_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
