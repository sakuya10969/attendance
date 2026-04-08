import type { MeResponseDto } from "~/shared/api/model";

export type AppRole = MeResponseDto["role"];

export interface AuthContextValue {
  firebaseUser: import("firebase/auth").User | null;
  appUser: MeResponseDto | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}
