// Hook (use-auth.js) - Credits to https://usehooks.com/useAuth
// TODO: Deal with variable typing properly.

import React, { useState, useEffect, useContext, createContext } from "react";
import { app } from "config/firebaseConfig";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithCredential,
  onAuthStateChanged,
} from "firebase/auth";



// Add your Firebase credentials
const auth = getAuth(app);
const authContext: any = createContext(undefined);

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }: { children: any }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}
// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext);
};
// Provider hook that creates auth object and handles state
export function useProvideAuth() {
  const [user, setUser] = useState<any>(null);
  // Wrap any Firebase methods we want to use making sure ...
  // ... to save the user to state.
  const signin = (email: any, password: any) => {
    return signInWithEmailAndPassword(auth, email, password).then(
      (response) => {
        setUser(response.user);
        return response.user;
      }
    );
  };
  const signup = (email: any, password: any) => {
    return createUserWithEmailAndPassword(auth, email, password).then(
      (response) => {
        setUser(response.user);
        return response.user;
      }
    );
  };
  const signout = () => {
    return signOut(auth).then(() => {
      setUser(false);
    });
  };
  const sendPwdResetEmail = (email: any) => {
    return sendPasswordResetEmail(auth, email).then(() => {
      return true;
    });
  };
  const confirmPwdReset = (code: any, password: any) => {
    return confirmPasswordReset(auth, code, password).then(() => {
      return true;
    });
  };
  // Subscribe to user on mount
  // Because this sets state in the callback it will cause any ...
  // ... component that utilizes this hook to re-render with the ...
  // ... latest auth object.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(false);
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  // Return the user object and auth methods
  return {
    user,
    signin,
    signup,
    signout,
    sendPwdResetEmail,
    confirmPwdReset,
  };
}
