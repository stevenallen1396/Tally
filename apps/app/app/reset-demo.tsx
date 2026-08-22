import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { clearIntroSeen } from "@/lib/introStorage";
import { supabase } from "@/lib/supabase";

// Visit /reset-demo directly (bookmark it, or save it as its own home-screen
// icon) to wipe the current session and the "seen intro" flag, then bounce
// back to a completely fresh first-time-visitor state. Doesn't touch
// anything else — regular app usage never routes through here.
export default function ResetDemo() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([supabase.auth.signOut(), clearIntroSeen()]).then(() => {
      if (cancelled) return;
      // A client-side <Redirect> wouldn't remount IntroOverlay, which only
      // checks its "seen" flag once on mount — a hard reload guarantees it
      // re-reads the now-cleared value instead of racing the clear above.
      if (Platform.OS === "web") {
        window.location.href = "/";
      } else {
        setDone(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!done) return null;
  return <Redirect href="/" />;
}
