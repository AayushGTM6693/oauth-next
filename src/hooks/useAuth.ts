"use client";
import { useState, useEffect, useCallback } from "react";
// for typescript
interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}
interface AuthState {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  error?: string;
}
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null, // user data, if logged in xaina --> null
    authenticated: false, // auth status ko lagi
    loading: true, // for loading state
  });
  // check /auth/me
  const checkAuth = useCallback(async () => {
    try {
      // going to /auth/me route
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (response.ok) {
        // success bhayo
        setAuthState({
          user: data.user,
          authenticated: true,
          loading: false,
        });
      } else if (response.status === 401) {
        // boom 401
        // access token expired
        console.log("Access token expired, attempting refresh");
        // attemptrefresh if 401 -- imp --- xa ---
        const refreshSuccess = await attemptRefresh();

        if (!refreshSuccess) {
          setAuthState({
            user: null,
            authenticated: false,
            loading: false,
            error: data.error,
          });
        }
      } else {
        setAuthState({
          user: null,
          authenticated: false,
          loading: false,
          error: data.error,
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        authenticated: false,
        loading: false,
        error: `Failed to check authentication ${error}`,
      });
    }
  }, []);
  // --- attempt refresh ---
  // step 2: try refresh token
  const attemptRefresh = useCallback(async (): Promise<boolean> => {
    // calling refresh token
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
      });
      if (response.ok) {
        console.log("Refresh successfully, calling auth/me again");
        // calling /auth/me only if refresh ok
        const meResponse = await fetch("/api/auth/me");
        const meData = await meResponse.json();

        if (meResponse.ok) {
          setAuthState({
            user: meData.user,
            authenticated: true,
            loading: false,
          });
          return true;
        }
      }
      console.log("Refresh failed");
      return false;
    } catch (error) {
      console.error("Refresh error:", error);
      return false;
    }
  }, []);

  // manual refresh function
  const refreshAuth = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    const success = await attemptRefresh();
    if (!success) {
      setAuthState({
        user: null,
        authenticated: false,
        loading: false,
        error: "Refresh failed",
      });
    }
  }, [attemptRefresh]);

  const signIn = useCallback(() => {
    window.location.href = "/api/auth/google";
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthState({
        user: null,
        authenticated: false,
        loading: true,
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed", error);
    }
  }, []);

  // hook first use huda auth check garxa
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  // return state ra function
  return {
    ...authState,
    signIn,
    signOut,
    refreshAuth,
    checkAuth,
  };
}

// curl -b "access_token=valid_token" http://localhost:3000/api/auth/me --> 200 ok
