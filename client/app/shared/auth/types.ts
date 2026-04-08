import type { MeResponseDto } from "../api/model";

export type AppRole = MeResponseDto["role"];

export interface AuthContextValue {
  firebaseUser: import("firebase/auth").User | null;
  appUser: MeResponseDto | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}
