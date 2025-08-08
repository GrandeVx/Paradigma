"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { z } from "zod";
import Link from "next/link";

const emailSchema = z.string().email("Please enter a valid email address");

export default function SignInPage() {
  const router = useRouter();
  const { sendVerificationOtp, error, isLoading, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const validateEmail = (email: string) => {
    try {
      emailSchema.parse(email);
      setValidationError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationError(err.errors[0]?.message || "Invalid email");
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!validateEmail(email)) {
      return;
    }

    try {
      await sendVerificationOtp(email);
      
      // Store email in sessionStorage as backup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('verify-email', email);
      }
      
      // Navigate to verification page
      router.push(`/sign-in/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("Error sending OTP:", err);
    }
  };

  const canContinue = email && emailSchema.safeParse(email).success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-gray-600">
            Enter your email to receive a verification code
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || validationError) && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-700">
                {validationError || error}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              ref={emailInputRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationError) setValidationError(null);
                if (error) clearError();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canContinue) {
                  handleSubmit(e as any);
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!canContinue || isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Continue"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            New to Paradigma?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
