"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider data-oid="ssfe:qw">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} data-oid="evsh6tr">
            <div className="grid gap-1" data-oid="aybmwdy">
              {title && <ToastTitle data-oid="ayuy7.-">{title}</ToastTitle>}
              {description && (
                <ToastDescription data-oid="8a21-i4">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose data-oid="2thwm:r" />
          </Toast>
        );
      })}
      <ToastViewport data-oid="uvvshyk" />
    </ToastProvider>
  );
}
