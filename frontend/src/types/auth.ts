export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
