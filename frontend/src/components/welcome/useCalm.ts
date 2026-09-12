import { useReducedMotion } from "framer-motion";

/** True when the visitor asked for reduced motion — freeze parallax/loops. */
export function useCalm() {
  return useReducedMotion() ?? false;
}
