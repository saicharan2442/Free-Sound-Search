import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { checkAuthStatus, logout as logoutApi } from "@/lib/authApi";

interface AuthContextType {
  user: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setLoginState: (user: string) => void; // Allow immediate login state update after OTP
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refresh = useCallback(async (retries = 3) => {
    setIsLoading(true);
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`Auth check attempt ${attempt + 1}/${retries}`);
        const status = await checkAuthStatus();
        console.log("Auth status result:", status);
        
        if (status.logged_in && status.user) {
          console.log("User logged in:", status.user);
          setUser(status.user);
          setIsLoggedIn(true);
          setIsLoading(false);
          return;
        } else {
          console.log("User not logged in, attempt", attempt + 1);
          if (attempt < retries - 1) {
            console.log("Waiting 500ms before next attempt...");
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        }
      } catch (error) {
        console.error(`Auth check error (attempt ${attempt + 1}):`, error);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    // Final state - not logged in
    console.log("Auth check complete: user not logged in");
    setUser(null);
    setIsLoggedIn(false);
    setIsLoading(false);
  }, []);

  // Initial auth check on mount
  useEffect(() => {
    console.log("AuthProvider mounted, running initial auth check");
    refresh(3);
  }, [refresh]);

  // Refresh auth status every 30 seconds to keep session alive and sync across tabs
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Periodic auth refresh");
      refresh(1);
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, []);

  const setLoginState = useCallback((userEmail: string) => {
    console.log("Setting login state immediately for:", userEmail);
    setUser(userEmail);
    setIsLoggedIn(true);
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn,
    logout,
    refresh,
    setLoginState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
