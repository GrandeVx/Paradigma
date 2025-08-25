"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  onComplete?: (value: string) => void;
}

export function OTPInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  className,
  onComplete,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return;

    // Allow alphanumeric characters (letters and numbers)
    const alphanumericValue = inputValue.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    if (alphanumericValue.length <= 1) {
      const newValue = value.split("");
      newValue[index] = alphanumericValue;
      const result = newValue.join("").slice(0, length);
      onChange(result);

      // Auto-focus next input
      if (alphanumericValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = value.split("");

      if (newValue[index]) {
        // Clear current input
        newValue[index] = "";
        onChange(newValue.join(""));
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = "";
        onChange(newValue.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const alphanumericData = pastedData.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, length);

    if (alphanumericData) {
      onChange(alphanumericData);
      // Focus the last filled input or the last input if all are filled
      const focusIndex = Math.min(alphanumericData.length - 1, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="text"
          autoFocus={autoFocus}
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-semibold",
            "border-2 border-gray-200 rounded-lg",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none",
            "transition-all duration-200",
            "disabled:bg-gray-50 disabled:text-gray-500",
            {
              "border-blue-500 ring-2 ring-blue-200": value[index],
              "animate-pulse": disabled,
            }
          )}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}