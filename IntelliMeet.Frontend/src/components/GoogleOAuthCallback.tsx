import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imApi } from '../api/intellimeet';
import { setGoogleSession } from '../lib/googleSession';

const GoogleOAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('Signing you in…');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const code = q.get('code');
    const err = q.get('error');
    if (err) {
      setMsg(`Google error: ${err}`);
      return;
    }
    if (!code) {
      setMsg('Missing authorization code. Return to Calendar and try again.');
      return;
    }
    (async () => {
      try {
        const tok = await imApi.exchangeGoogleCode(code);
        if (!tok.refreshToken) {
          setMsg(
            'No refresh token returned. In Google Cloud Console ensure access_type=offline; revoke app access at https://myaccount.google.com/permissions and sign in again.'
          );
          return;
        }
        setGoogleSession(tok.refreshToken, tok.email ?? undefined);
        setMsg('Connected. Redirecting…');
        navigate('/calendar', { replace: true });
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Token exchange failed');
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-surface-lv1 p-6">
      <p className="font-inter text-text-primary text-center max-w-md">{msg}</p>
    </div>
  );
};

export default GoogleOAuthCallback;
