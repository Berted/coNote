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
  User,
  verifyPasswordResetCode,
  ActionCodeSettings,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  get,
  set,
  DataSnapshot,
  onValue,
  push,
  serverTimestamp,
} from "firebase/database";
import userType from "components/interfaces/userType";

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
  const [user, setUser] = useState<User | null | false>(null);
  const [userData, setUserData] = useState<userType | undefined>(undefined);
  // Wrap any Firebase methods we want to use making sure ...
  // ... to save the user to state.
  const signin = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
      .then((response) => {
        setUser(response.user);
        return response.user;
      })
      .then((user) => {
        get(ref(getDatabase(), `users/${user.uid}`)).then((snapshot) => {
          let snapvar = snapshot.val();
          // TODO: Better solutions definitely exist, but autopopulating the fields works for now.
          if (snapvar.fullname === undefined) {
            set(
              ref(getDatabase(), `users/${user.uid}/fullname`),
              user.email || "[UNKNOWN]"
            );
          }
          if (snapvar.img_url === undefined) {
            set(ref(getDatabase(), `users/${user.uid}/img_url`), "");
          }
        });

        // TODO: Only needed as this is added at a later date in comparison to the original database. A new database will no longer need this line.
        if (user.email) {
          set(
            ref(
              getDatabase(),
              `email_to_uid/${user.email.replaceAll(".", ",")}`
            ),
            user.uid
          ).catch((e) => console.log(e));
        }
      });
  };
  const signup = (email: string, password: string, props: any) => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((response) => {
        setUser(response.user);
        return response.user;
      })
      .then((user) => {
        set(ref(getDatabase(), `users/${user.uid}`), {
          fullname: props.fullname,
          img_url: "",
          owned_documents: {},
        }).catch((e) => {
          console.log("SetUserData Error: " + e); // TODO: Alert notification?
        });

        if (user.email) {
          // TODO: Solution is a bit hacky, but works for now. Could crop out as an issue later, maybe fix? (or at least filter sign-ups to not allow these id-s).
          set(
            ref(
              getDatabase(),
              `email_to_uid/${user.email.replaceAll(".", ",")}`
            ),
            user.uid
          ).catch((e) => console.log("SetEmailData Error: " + e));
        }
        return user;
      })
      .then(async (user) => {
        if (!user) return;
        const welcomeDocument = '-N7_A0yVxAjjB-jtlQaN';
        let history = await get(ref(getDatabase(), `docs/${welcomeDocument}/history`))
          .then((snapshot) => {
            console.log(snapshot.val());
            return snapshot.val();
          });
        const newDocRef = push(ref(getDatabase(), `docs`), {
          public: false,
          roles: {
            [user.uid]: "owner",
          },
          tags: {
            '-': 'conote',
          },
          history: history,
          timestamp: serverTimestamp(),
          title: "Welcome to coNote!",
        });
        set(
          ref(
            getDatabase(),
            `users/${user.uid}/owned_documents/${newDocRef.key}`
          ),
          true
        ).catch((e) => {
          console.log("Set Error: " + e); // TODO: Alert notification?
        });
      });
  };
  const signout = () => {
    return signOut(auth).then(() => {
      setUser(false);
    });
  };
  const sendPwdResetEmail = (email: string, actionCodeSettings?: ActionCodeSettings | undefined) => {
    return sendPasswordResetEmail(auth, email, actionCodeSettings).then(() => {
      return true;
    });
  };
  const confirmPwdReset = (code: string, password: string) => {
    return confirmPasswordReset(auth, code, password).then(() => {
      return true;
    });
  };
  const verifyPwdResetCode = (code: string) => {
    return verifyPasswordResetCode(auth, code);
  }

  const updateUserData = (snapshot: DataSnapshot) => {
    if (user) {
      if (snapshot.exists()) {
        let snapvar = snapshot.val();
        if (snapvar.owned_documents === undefined) {
          snapvar.owned_documents = {};
        }
        setUserData(snapvar);
      } else {
        // TODO: Can be deprecated soon.
        set(ref(getDatabase(), `users/${user.uid}`), {
          fullname: user.email || "[UNKNOWN]",
          img_url: "",
          owned_documents: {},
        });
      }
    }
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
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onValue(
      ref(getDatabase(), `users/${user.uid}`),
      updateUserData,
      (e) => {
        // TODO: Alert notification?
        console.log("User fetch error: " + e);
      }
    );

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Return the user object and auth methods
  return {
    user,
    userData,
    signin,
    signup,
    signout,
    sendPwdResetEmail,
    confirmPwdReset,
    verifyPwdResetCode,
  };
}
