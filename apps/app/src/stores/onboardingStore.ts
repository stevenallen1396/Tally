import { create } from "zustand";

// The (app) layout's onboarding gate reads its own useProfile() instance,
// which has no way to know onboarding.tsx just saved a profile via a
// separate instance — router.replace() re-evaluates the gate before that
// refetch lands, bouncing straight back to onboarding with a blank form.
// This flag is set synchronously the moment onboarding actually completes,
// so the gate doesn't have to wait on the async refetch to catch up.
type OnboardingStore = {
  completedThisSession: boolean;
  markCompleted: () => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  completedThisSession: false,
  markCompleted: () => set({ completedThisSession: true }),
}));
