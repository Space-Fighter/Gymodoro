import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              size?: string;
              theme?: string;
              shape?: string;
              text?: string;
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Google's library must be initialize()d exactly once per page, but this hook
// is used by several components (sign-in, sign-up, welcome page) and React
// StrictMode mounts effects twice in dev. So initialization state lives at
// module level, and the one Google callback hands the ID token to whichever
// component's handler is currently registered.
let initialized = false;
const handlers = new Set<(idToken: string) => void>();

function initGoogleOnce() {
  if (initialized || !GOOGLE_CLIENT_ID || !window.google) return;
  initialized = true;
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => handlers.forEach((h) => h(response.credential)),
  });
}

/**
 * Wraps Google Identity Services: initializes it once the /gsi/client script
 * has loaded and routes the returned ID token (a signed JWT, verified by the
 * backend) to `onCredential`. `ready` turns true once Google's library can
 * render its button; see `GoogleSignInButton`, which renders Google's real
 * button (popup flow, no FedCM prompt) under a custom-styled one.
 */
export function useGoogleSignIn(onCredential: (idToken: string) => void) {
  const [ready, setReady] = useState(initialized);

  useEffect(() => {
    handlers.add(onCredential);
    return () => {
      handlers.delete(onCredential);
    };
  }, [onCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || initialized) return;
    const tryInit = () => {
      if (!window.google) return false;
      initGoogleOnce();
      setReady(true);
      return true;
    };
    if (tryInit()) return;
    // The GSI script loads async; poll until it's there.
    const interval = setInterval(() => {
      if (tryInit()) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return { ready: ready && initialized };
}
