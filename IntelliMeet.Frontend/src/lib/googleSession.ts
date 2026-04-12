const RT = 'im_google_refresh_token';
const EM = 'im_google_email';

export function getGoogleRefreshToken(): string | null {
  return sessionStorage.getItem(RT);
}

export function setGoogleSession(refreshToken: string, email?: string | null): void {
  sessionStorage.setItem(RT, refreshToken);
  if (email) sessionStorage.setItem(EM, email);
}

export function getGoogleEmail(): string | null {
  return sessionStorage.getItem(EM);
}

export function clearGoogleSession(): void {
  sessionStorage.removeItem(RT);
  sessionStorage.removeItem(EM);
}
