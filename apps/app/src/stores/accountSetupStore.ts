import { create } from "zustand";

// Transient, in-memory only — carries values between the "Save your
// account" wizard's steps until the final submit; never persisted.
type AccountSetupStore = {
  email: string;
  password: string;
  displayName: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setDisplayName: (displayName: string) => void;
  reset: () => void;
};

export const useAccountSetupStore = create<AccountSetupStore>((set) => ({
  email: "",
  password: "",
  displayName: "",
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setDisplayName: (displayName) => set({ displayName }),
  reset: () => set({ email: "", password: "", displayName: "" }),
}));
