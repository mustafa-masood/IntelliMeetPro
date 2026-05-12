import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.tsx';
import { clerkPublishableKey, isClerkConfigured } from './config/clerk';

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
