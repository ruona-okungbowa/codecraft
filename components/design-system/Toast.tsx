/**
 * CodeCraft Design System - Toast Notification Component
 *
 * Feedback messages with animations
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  variant?: ToastVariant;
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  icon?: ReactNode;
}

const variantStyles: Record<
  ToastVariant,
  { bg: string; border: string; icon: ReactNode; iconColor: string }
> = {
  success: {
    bg: "bg-growth-50",
    border: "border-growth-300",
    icon: <CheckCircle size={20} />,
    iconColor: "text-growth-600",
  },
  error: {
    bg: "bg-error-50",
    border: "border-error-300",
    icon: <AlertCircle size={20} />,
    iconColor: "text-error-600",
  },
  warning: {
    bg: "bg-energy-50",
    border: "border-energy-300",
    icon: <AlertTriangle size={20} />,
    iconColor: "text-energy-600",
  },
  info: {
    bg: "bg-primary-50",
    border: "border-primary-300",
    icon: <Info size={20} />,
    iconColor: "text-primary-600",
  },
};

export default function Toast({
  variant = "info",
  title,
  message,
  isVisible,
  onClose,
  icon,
}: ToastProps) {
  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`
            fixed top-4 right-4 z-50 max-w-md w-full
            ${styles.bg} ${styles.border} border-2
            rounded-2xl shadow-xl p-4
          `}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${styles.iconColor}`}>
              {icon || styles.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-neutral-900 mb-1">{title}</h4>
              {message && (
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {message}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
