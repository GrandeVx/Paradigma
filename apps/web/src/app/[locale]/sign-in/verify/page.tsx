"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { OTPInput } from "@/components/auth/otp-input";
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithOtp, sendVerificationOtp, error, isLoading, clearError, isAuthenticated, session } = useAuth();

  const emailFromParams = searchParams.get("email") || "";
  const emailFromStorage = typeof window !== 'undefined' ? sessionStorage.getItem('verify-email') : null;
  const email = emailFromParams || emailFromStorage || "";

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Redirect if no email or already authenticated
  useEffect(() => {
    if (!email) {
      router.push("/sign-in");
    }
  }, [email, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-submit when OTP is complete
  const handleOTPComplete = async (value: string) => {
    if (value.length === 6 && !isVerifying) {
      setIsVerifying(true);
      try {
        await signInWithOtp(email, value);
      } catch (err) {
        setOtp(""); // Clear OTP on error
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleResendCode = async () => {
    try {
      clearError();
      await sendVerificationOtp(email);
      setCountdown(60);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      // Error already handled by useAuth hook
    }
  };

  const handleManualSubmit = () => {
    if (otp.length === 6) {
      handleOTPComplete(otp);
    }
  };

  // Only redirect if no email, keep the page visible for debugging
  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <Link
            href="/sign-in"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-gray-600 mb-2">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-blue-600 font-medium">
            {email}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* OTP Input */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter 6-character verification code (letters and numbers)
            </label>
            <OTPInput
              value={otp}
              onChange={setOtp}
              onComplete={handleOTPComplete}
              disabled={isLoading || isVerifying}
              autoFocus
            />
          </div>

          {/* Manual Submit Button (for accessibility) */}
          <button
            type="button"
            onClick={handleManualSubmit}
            disabled={otp.length !== 6 || isLoading || isVerifying}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {(isLoading || isVerifying) ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Verify Code"
            )}
          </button>
        </div>

        {/* Resend Code */}
        <div className="text-center">
          {!canResend ? (
            <p className="text-sm text-gray-500">
              Resend code in {countdown}s
            </p>
          ) : (
            <button
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
            >
              Didn't receive the code? Resend
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact support for assistance
          </p>
        </div>
      </div>
    </div>
  );
}