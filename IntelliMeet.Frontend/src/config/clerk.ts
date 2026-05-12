/** Clerk publishable key only (pk_test_… / pk_live_…). Never put the secret key in the frontend bundle. */
export const clerkPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '').trim();

export function isClerkConfigured(): boolean {
  return clerkPublishableKey.length > 0;
}

/** Matches `--color-primary-500` in index.css for Clerk embedded components */
export const clerkAppearance = {
  layout: { logoImageUrl: '', logoPlacement: 'none' as const },
  variables: {
    colorPrimary: '#16a34a',
    borderRadius: '0.5rem',
  },
};
