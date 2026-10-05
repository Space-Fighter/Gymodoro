import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";

interface Props {
  onCredential: (idToken: string) => void;
  /** Wording Google puts on the button. */
  text?: "signin_with" | "signup_with" | "continue_with";
  /** Google's own themes: filled_black suits our dark UI, outline is white. */
  theme?: "filled_black" | "filled_blue" | "outline";
  disabled?: boolean;
  className?: string;
}

// Google's official "Sign in with Google" button, drawn by Google's script
// using only the options Google supports (pill shape, theme, text, width).
// Clicking it opens Google's popup and returns an ID token to `onCredential`.
// Google caps the width at 400px and the height is fixed by `size`.
export default function GoogleSignInButton({
  onCredential,
  text = "signin_with",
  theme = "filled_black",
  disabled,
  className,
}: Props) {
  const { ready } = useGoogleSignIn(onCredential);
  const hostRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const box = boxRef.current;
    if (!ready || !host || !box || !window.google) return;

    const render = () => {
      if (!box.offsetWidth) return;
      host.innerHTML = "";
      window.google!.accounts.id.renderButton(host, {
        type: "standard",
        size: "large",
        shape: "pill",
        theme,
        text,
        width: Math.min(400, box.offsetWidth),
      });
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(box);
    return () => observer.disconnect();
  }, [ready, theme, text]);

  return (
    <div ref={boxRef} className={cn("w-full", disabled && "pointer-events-none opacity-50", className)}>
      <div ref={hostRef} className="flex justify-center" />
    </div>
  );
}
