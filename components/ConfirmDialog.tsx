"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "warning",
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "⚠️",
      confirmBg: "bg-red-500 hover:bg-red-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
    },
    warning: {
      icon: "⚠️",
      confirmBg: "bg-yellow-500 hover:bg-yellow-600",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-500",
    },
    info: {
      icon: "ℹ️",
      confirmBg: "bg-[#4c96e1] hover:bg-[#3a7bc8]",
      iconBg: "bg-blue-100",
      iconColor: "text-[#4c96e1]",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center shrink-0`}
          >
            <span className="text-2xl">{style.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg ${style.confirmBg} text-white font-semibold transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
