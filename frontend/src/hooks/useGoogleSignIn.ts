import { useCallback, useEffect, useRef } from "react";

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Wraps Google Identity Services' popup (token client) flow: initializes it
// once the /gsi/client script has loaded, then exposes a prompt you can
// trigger from a custom-styled button. Unlike One Tap's prompt() this does
// not go through FedCM, so it isn't affected by browser sign-in cooldowns.
// The callback receives a Google access token, which the backend verifies.
export function useGoogleSignIn(onCredential: (token: string) => void) {
  const client = useRef<TokenClient | null>(null);
  const onCredentialRef = useRef(onCredential);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || client.current) return;

    const init = () => {
      if (client.current || !window.google?.accounts.oauth2) return;
      client.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: (response) => {
          if (response.access_token) onCredentialRef.current(response.access_token);
          else if (response.error) console.error("Google sign-in failed:", response.error);
        },
        error_callback: (err) => console.warn("Google sign-in popup closed/failed:", err.type),
      });
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
    if (!client.current) {
      console.error("Google Sign-In is not available yet. Please try again in a moment.");
      return;
    }
    client.current.requestAccessToken();
  }, []);

  return { promptGoogleSignIn };
}
