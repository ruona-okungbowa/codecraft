"use client";

import { BarChart3, Trophy, Code2, Mail, LinkedinIcon } from "lucide-react";

export interface ProfileConfig {
  includeStats: boolean;
  includeTopLanguages: boolean;
  includeProjects: boolean;
  includeSkills: boolean;
  includeContact: boolean;
  includeSocials: boolean;
}

interface ProfileConfigSelectorProps {
  config: ProfileConfig;
  onChange: (config: ProfileConfig) => void;
}

const configOptions = [
  {
    key: "includeStats" as keyof ProfileConfig,
    label: "GitHub Stats",
    description: "Show contribution stats and activity",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    key: "includeTopLanguages" as keyof ProfileConfig,
    label: "Top Languages",
    description: "Display most used programming languages",
    icon: <Code2 className="w-5 h-5" />,
  },
  {
    key: "includeProjects" as keyof ProfileConfig,
    label: "Featured Projects",
    description: "Highlight your best repositories",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    key: "includeSkills" as keyof ProfileConfig,
    label: "Skills & Tech Stack",
    description: "Show technology badges and skills",
    icon: <Code2 className="w-5 h-5" />,
  },
  {
    key: "includeContact" as keyof ProfileConfig,
    label: "Contact Info",
    description: "Add email and ways to reach you",
    icon: <Mail className="w-5 h-5" />,
  },
  {
    key: "includeSocials" as keyof ProfileConfig,
    label: "Social Links",
    description: "Link to LinkedIn, Twitter, portfolio",
    icon: <LinkedinIcon className="w-5 h-5" />,
  },
];

export default function ProfileConfigSelector({
  config,
  onChange,
}: ProfileConfigSelectorProps) {
  const toggleOption = (key: keyof ProfileConfig) => {
    onChange({
      ...config,
      [key]: !config[key],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Profile Configuration
        </h3>
        <button
          onClick={() => {
            const allEnabled = Object.values(config).every((v) => v);
            const newConfig = Object.keys(config).reduce(
              (acc, key) => ({
                ...acc,
                [key]: !allEnabled,
              }),
              {} as ProfileConfig
            );
            onChange(newConfig);
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {Object.values(config).every((v) => v)
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {configOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => toggleOption(option.key)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              config[option.key]
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  config[option.key]
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 flex items-center justify-between">
                  {option.label}
                  <input
                    type="checkbox"
                    checked={config[option.key]}
                    onChange={() => toggleOption(option.key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {option.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
