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
}
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null, // user data, if logged in xaina --> null
    authenticated: false, // auth status ko lagi
    loading: true, // for loading state
  });
  // check session
  const checkSession = useCallback(async () => {
    try {
      // session api lai call garxa
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      console.log("Session API response:", data); // check garnalai
      // state update gareko by using session data
      setAuthState({
        user: data.user
          ? { ...data.user, image: data.user.picture || data.user.image }
          : null,
        authenticated: data.authenticated,
        loading: false,
      });
    } catch (error) {
      console.error("session check failed:", error);
      setAuthState({
        user: null,
        authenticated: false,
        loading: false,
      });
    }
  }, []);
  // signin lai initiate garxa
  const signIn = useCallback(() => {
    window.location.href = "/api/auth/google";
  }, []);
  // for signout
  const signOut = useCallback(async () => {
    try {
      // call logout api
      await fetch("/api/auth/logout", { method: "POST" });
      // local state lai change garxa
      setAuthState({
        user: null,
        authenticated: false,
        loading: false,
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed", error);
    }
  }, []);
  // hook first use huda session check garxa
  useEffect(() => {
    checkSession();
  }, [checkSession]);
  // return state ra function
  return {
    ...authState,
    signIn,
    signOut,
    refreshSession: checkSession,
  };
}
