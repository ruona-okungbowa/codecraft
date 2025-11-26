"use client";

import { ReadmeTemplate } from "@/lib/readme/types";
import { Minimize2, FileText, Image, Briefcase } from "lucide-react";

interface TemplateSelectorProps {
  selectedTemplate: ReadmeTemplate;
  onSelect: (template: ReadmeTemplate) => void;
}

const templates: Array<{
  value: ReadmeTemplate;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Clean and concise. Essential sections only.",
    icon: <Minimize2 className="w-5 h-5" />,
  },
  {
    value: "detailed",
    label: "Detailed",
    description: "Comprehensive documentation with examples.",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    value: "visual",
    label: "Visual",
    description: "Eye-catching with screenshots and diagrams.",
    icon: <Image className="w-5 h-5" />,
  },
  {
    value: "professional",
    label: "Professional",
    description: "Polished with badges and proper structure.",
    icon: <Briefcase className="w-5 h-5" />,
  },
];

export default function TemplateSelector({
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Choose Template Style
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map((template) => (
          <button
            key={template.value}
            onClick={() => onSelect(template.value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedTemplate === template.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div
                className={`p-2 rounded-lg ${
                  selectedTemplate === template.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {template.icon}
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">
                  {template.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {template.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
