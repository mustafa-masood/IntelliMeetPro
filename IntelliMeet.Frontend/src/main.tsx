import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.tsx';
import { clerkPublishableKey, isClerkConfigured } from './config/clerk';

const COLOR_MODE_STORAGE_KEY = 'im-color-mode';

function applyStoredColorMode() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const stored = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    document.documentElement.classList.toggle('dark', useDark);
  } catch {
    /* ignore */
  }
}

applyStoredColorMode();

if (import.meta.env.DEV && !isClerkConfigured()) {
  console.info(
    '[IntelliMeet] Clerk UI is disabled: add VITE_CLERK_PUBLISHABLE_KEY to IntelliMeet.Frontend/.env (pk_test_… or pk_live_… from Clerk → API Keys). Do not put the Clerk secret key in the frontend.'
  );
}

const app = isClerkConfigured() ? (
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <App />
  </ClerkProvider>
) : (
  <App />
);

createRoot(document.getElementById('root')!).render(<StrictMode>{app}</StrictMode>);
