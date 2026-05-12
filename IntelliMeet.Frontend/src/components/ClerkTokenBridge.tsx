import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setClerkBearerToken } from '../api/intellimeet';

/** Keeps the API client Authorization header in sync with the active Clerk session. */
export function ClerkTokenBridge() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (!isSignedIn) {
        setClerkBearerToken(null);
        return;
      }
      try {
        const t = await getToken();
        if (!cancelled) setClerkBearerToken(t);
      } catch {
        if (!cancelled) setClerkBearerToken(null);
      }
    };

    void refresh();
    const id = window.setInterval(() => void refresh(), 50_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isSignedIn, getToken]);

  return null;
}
