import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { imApi, setClerkBearerToken } from '../api/intellimeet';
import { isClerkConfigured } from '../config/clerk';

/** After Clerk sign-in/up, send user to plan selection or meetings. */
function PostSignInRedirectInner() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      navigate('/signup', { replace: true });
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        for (let i = 0; i < 6 && !cancelled; i += 1) {
          try {
            const token = await getToken();
            if (token) setClerkBearerToken(token);
            const s = await imApi.onboardingMe();
            if (cancelled) return;
            navigate(s.needsPlanSelection ? '/onboarding/plan' : '/meetings', { replace: true });
            return;
          } catch {
            await new Promise((r) => window.setTimeout(r, 250));
          }
        }
        if (!cancelled) navigate('/onboarding/plan', { replace: true });
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isLoaded, isSignedIn, getToken, navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-bg-surface-lv1 p-6">
      <p className="font-inter text-text-secondary text-sm">Signing you in…</p>
    </div>
  );
}

const PostSignInRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isClerkConfigured()) navigate('/signin', { replace: true });
  }, [navigate]);

  if (!isClerkConfigured()) return null;
  return <PostSignInRedirectInner />;
};

export default PostSignInRedirect;
