import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { Home } from "./components/Home";
import { Onboarding } from "./components/Onboarding";
import { loadProfile, saveProfile } from "./lib/storage";
import type { UserProfile } from "./types";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    loadProfile(),
  );

  function handleRestartOnboarding() {
    if (!profile) return;

    const nextProfile: UserProfile = {
      ...profile,
      onboardingCompleted: false,
    };

    saveProfile(nextProfile);
    setProfile(nextProfile);
  }

  return (
    <AppShell>
      {!profile?.onboardingCompleted ? (
        <Onboarding onDone={setProfile} />
      ) : (
        <Home
          profile={profile}
          onProfileChange={setProfile}
          onRestartOnboarding={handleRestartOnboarding}
        />
      )}
    </AppShell>
  );
}
