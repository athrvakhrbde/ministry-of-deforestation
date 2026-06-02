"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, onDismiss, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div
      className="fixed z-50 toast-telegram left-3 right-3 sm:left-4 sm:right-auto sm:max-w-sm"
      style={{
        bottom: "calc(1rem + var(--safe-bottom))",
      }}
    >
      <div className="bg-black border border-paper/30 border-l-4 border-l-red-stamp px-4 py-3 font-data text-xs text-paper shadow-lg">
        <span className="text-red-stamp mr-2">⚡</span>
        <span className="break-words">{message}</span>
      </div>
    </div>
  );
}
