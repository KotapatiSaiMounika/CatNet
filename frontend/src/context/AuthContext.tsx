import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import {
  getMeRequest,
  loginRequest,
  logoutRequest,
  signupRequest,
  type LoginInput,
  type SignupInput,
} from "@/lib/auth";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { ApiClientError } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for an existing session via the httpOnly cookie.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const me = await getMeRequest();
      if (cancelled) return;
      setUser(me);
      if (me) connectSocket(me._id);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const loggedInUser = await loginRequest(input);
    setUser(loggedInUser);
    connectSocket(loggedInUser._id);
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const newUser = await signupRequest(input);
    setUser(newUser);
    connectSocket(newUser._id);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      // Even if the network call fails, clear local state so the UI
      // doesn't get stuck believing the user is still logged in.
      if (!(error instanceof ApiClientError)) throw error;
    } finally {
      setUser(null);
      disconnectSocket();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}