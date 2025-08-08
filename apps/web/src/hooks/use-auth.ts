"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { emailOtp, useSession, signOut as betterAuthSignOut, signIn } from "@paradigma/auth";

interface AuthState {
  user: any;
  session: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  sendVerificationOtp: (email: string) => Promise<void>;
  signInWithOtp: (email: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const { data: session, isPending, error: sessionError } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = () => setError(null);

  const sendVerificationOtp = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await emailOtp.sendVerificationOtp({
        email,
        type: "sign-in"
      });

      if (error) {
        throw new Error(error.message || "Failed to send verification code");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send verification code";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOtp = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn.emailOtp({
        email,
        otp: otp.trim().toUpperCase()
      });

      if (result.error) {
        throw new Error(result.error.message || "Invalid verification code");
      }
      
      // Force a full page refresh to ensure session is properly loaded
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = "/dashboard";
        }
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid verification code";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await betterAuthSignOut();
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: session?.user || null,
    session: session || null,
    isLoading: isPending || isLoading,
    isAuthenticated: !!session?.user,
    sendVerificationOtp,
    signInWithOtp,
    signOut,
    error: error || sessionError?.message || null,
    clearError,
  };
}