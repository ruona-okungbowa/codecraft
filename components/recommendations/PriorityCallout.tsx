"use client";

import { AlertCircle, ArrowRight } from "lucide-react";

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
    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-5 mb-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Alert Icon */}
        <div className="shrink-0 mt-0.5">
          <AlertCircle size={24} className="text-orange-600" />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Title */}
          <h3 className="text-lg font-semibold text-orange-900 mb-2">
            Critical skill gaps detected
          </h3>

          {/* Description */}
          <p className="text-sm text-orange-800 mb-3">
            You&apos;re missing {criticalGaps.length} essential skill
            {criticalGaps.length !== 1 ? "s" : ""} for the{" "}
            <span className="font-semibold">{targetRole}</span> role. Focus on
            high-priority projects to address these gaps quickly.
          </p>

          {/* View Critical Projects Link */}
          <button
            onClick={onViewCritical}
            aria-label={`View ${criticalGaps.length} critical projects`}
            className="inline-flex items-center gap-2 text-sm font-medium text-orange-700 hover:text-orange-900 transition-colors group"
          >
            <span>View critical projects</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
