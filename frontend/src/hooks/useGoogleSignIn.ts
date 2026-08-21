import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Wraps Google Identity Services: initializes it once the /gsi/client
// script has loaded, then exposes a prompt() you can trigger from a
// custom-styled button (GSI's own button can't be restyled to match ours).
export function useGoogleSignIn(onCredential: (idToken: string) => void) {
  const initialized = useRef(false);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || initialized.current) return;

    const init = () => {
      if (initialized.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onCredentialRef.current(response.credential),
      });
      initialized.current = true;
    };

    if (window.google) {
      init();
      return;
    }

    const interval = setInterval(() => {
      if (window.google) {
        init();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const promptGoogleSignIn = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) {
      console.error("Google Sign-In is not available yet. Please try again in a moment.");
      return;
    }
    window.google.accounts.id.prompt();
  }, []);

  return { promptGoogleSignIn };
}
