import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureBackendUserId, imApi, setClerkBearerToken } from '../api/intellimeet';
import { isClerkConfigured } from '../config/clerk';

/**
 * Trello returns token in the URL hash: #token=...
 * With Clerk: session must be ready so the backend stores the token on the signed-in user (not the demo fallback).
 */
function TrelloOAuthCallbackClerk() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const { isLoaded, isSignedIn, getToken } = useAuth();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (!isLoaded) return;
                if (!isSignedIn) {
                    setError('Sign in to IntelliMeet first, then connect Trello again.');
                    return;
                }

                const hash = window.location.hash?.replace(/^#/, '') ?? '';
                const params = new URLSearchParams(hash);
                const token = params.get('token');
                if (!token?.trim()) {
                    setError('No token in URL hash.');
                    return;
                }

                const bearer = await getToken();
                if (!bearer) {
                    setError('Could not read session; try signing in again.');
                    return;
                }
                setClerkBearerToken(bearer);
                const userId = await ensureBackendUserId();
                await imApi.processTrelloToken(token.trim(), userId);
                if (!cancelled) navigate('/deferred/app-integrations?setup=trello', { replace: true });
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to link Trello');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [navigate, isLoaded, isSignedIn, getToken]);

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-bg-surface-lv1 px-4">
            <p className="text-sm font-inter text-text-secondary m-0">
                {error ?? (isLoaded ? 'Connecting Trello…' : 'Loading session…')}
            </p>
        </div>
    );
}

/** Demo / no-Clerk: link token using legacy user id resolution. */
function TrelloOAuthCallbackDemo() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const hash = window.location.hash?.replace(/^#/, '') ?? '';
                const params = new URLSearchParams(hash);
                const token = params.get('token');
                if (!token?.trim()) {
                    setError('No token in URL hash.');
                    return;
                }
                const userId = await ensureBackendUserId();
                await imApi.processTrelloToken(token.trim(), userId);
                if (!cancelled) navigate('/deferred/app-integrations?setup=trello', { replace: true });
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to link Trello');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-bg-surface-lv1 px-4">
            <p className="text-sm font-inter text-text-secondary m-0">{error ?? 'Connecting Trello…'}</p>
        </div>
    );
}

export default function TrelloOAuthCallback() {
    return isClerkConfigured() ? <TrelloOAuthCallbackClerk /> : <TrelloOAuthCallbackDemo />;
}
