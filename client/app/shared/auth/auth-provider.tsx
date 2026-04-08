import { createContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { notifications } from "@mantine/notifications";
import axios from "axios";

import { auth } from "~/lib/firebase";
import { authControllerMe } from "../api/endpoints/auth/auth";
import type { MeResponseDto } from "../api/model";
import type { AuthContextValue } from "./types";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<MeResponseDto | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  async function loadAppUser(nextUser: User | null) {
    if (!nextUser) {
      setAppUser(null);
      return;
    }

    try {
      const me = await authControllerMe();
      setAppUser(me);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setAppUser(null);
        return;
      }

      notifications.show({
        color: "red",
        title: "認証エラー",
        message: "ユーザー情報の取得に失敗しました。",
      });
      setAppUser(null);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);
      await loadAppUser(nextUser);
      setIsInitializing(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      appUser,
      isInitializing,
      isAuthenticated: Boolean(firebaseUser && appUser),
      async signIn(email, password) {
        await signInWithEmailAndPassword(auth, email, password);
      },
      async signOut() {
        await firebaseSignOut(auth);
        setAppUser(null);
      },
      async refreshAppUser() {
        await loadAppUser(auth.currentUser);
      },
    }),
    [appUser, firebaseUser, isInitializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
