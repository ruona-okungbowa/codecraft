"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface PriorityCalloutProps {
  criticalGaps: string[];
  targetRole: string;
  onViewCritical: () => void;
}

export default function PriorityCallout({
  criticalGaps,
  targetRole,
  onViewCritical,
}: PriorityCalloutProps) {
  if (criticalGaps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-orange-50 border border-orange-200 border-l-4 border-l-orange-500 rounded-lg p-5 mx-10 mb-6"
    >
      <div className="flex items-start gap-4">
        <AlertTriangle
          size={24}
          className="text-orange-600 flex-shrink-0 mt-0.5"
        />
        <div className="flex-1">
          <h3 className="text-base font-bold text-orange-900 mb-1">
            Critical skill gaps detected
          </h3>
          <p className="text-sm text-orange-700 mb-3">
            These projects address your most urgent needs for {targetRole} roles
          </p>
          <button
            onClick={onViewCritical}
            className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
          >
            View critical projects →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
