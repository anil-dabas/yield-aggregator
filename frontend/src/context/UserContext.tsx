import { createContext, useContext, useState, ReactNode } from 'react';
import {HardcodedUser, hardcodedUsers} from '../users';

interface UserContextType {
  user: HardcodedUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<HardcodedUser | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = hardcodedUsers.find(
        (u) => u.username === username && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
      <UserContext.Provider value={{ user, login, logout }}>
        {children}
      </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};