"use client";

import {
  FileCode,
  Rocket,
  BookOpen,
  Users,
  Scale,
  Award,
  Play,
} from "lucide-react";

export interface ProjectConfig {
  installation: boolean;
  usage: boolean;
  api: boolean;
  contributing: boolean;
  license: boolean;
  badges: boolean;
  demo: boolean;
}

interface ProjectConfigSelectorProps {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

const configOptions = [
  {
    key: "installation" as keyof ProjectConfig,
    label: "Installation",
    description: "Setup and installation instructions",
    icon: <FileCode className="w-5 h-5" />,
  },
  {
    key: "usage" as keyof ProjectConfig,
    label: "Usage",
    description: "How to use the project",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    key: "demo" as keyof ProjectConfig,
    label: "Demo",
    description: "Live demo or screenshots",
    icon: <Play className="w-5 h-5" />,
  },
  {
    key: "api" as keyof ProjectConfig,
    label: "API Documentation",
    description: "API endpoints and usage",
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    key: "badges" as keyof ProjectConfig,
    label: "Badges",
    description: "Status badges (build, coverage, etc.)",
    icon: <Award className="w-5 h-5" />,
  },
  {
    key: "contributing" as keyof ProjectConfig,
    label: "Contributing",
    description: "Contribution guidelines",
    icon: <Users className="w-5 h-5" />,
  },
  {
    key: "license" as keyof ProjectConfig,
    label: "License",
    description: "License information",
    icon: <Scale className="w-5 h-5" />,
  },
];

export default function ProjectConfigSelector({
  config,
  onChange,
}: ProjectConfigSelectorProps) {
  const toggleOption = (key: keyof ProjectConfig) => {
    onChange({
      ...config,
      [key]: !config[key],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Project Configuration
        </h3>
        <button
          onClick={() => {
            const allEnabled = Object.values(config).every((v) => v);
            const newConfig = Object.keys(config).reduce(
              (acc, key) => ({
                ...acc,
                [key]: !allEnabled,
              }),
              {} as ProjectConfig
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
                className={`p-2 rounded-lg flex-shrink-0 ${
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
