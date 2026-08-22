import { useContext } from "react";
import { AuthContext } from "@/context/auth-context-value";
import type { AuthContextType } from "@/context/auth-context-value";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
