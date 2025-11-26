"use client";

import { FileText, User } from "lucide-react";

interface TypeSelectorProps {
  selectedType: "project" | "profile" | null;
  onSelect: (type: "project" | "profile") => void;
}

export default function TypeSelector({
  selectedType,
  onSelect,
}: TypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Choose README Type</h2>
      <p className="text-gray-600">
        Select whether you want to generate a project README or a profile README
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Project README Option */}
        <button
          onClick={() => onSelect("project")}
          className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
            selectedType === "project"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-lg ${
                selectedType === "project"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Project README
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Generate a professional README for a specific GitHub repository
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-500">
                <li>• Installation instructions</li>
                <li>• Usage examples</li>
                <li>• Tech stack badges</li>
                <li>• Contributing guidelines</li>
              </ul>
            </div>
          </div>
        </button>

        {/* Profile README Option */}
        <button
          onClick={() => onSelect("profile")}
          className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
            selectedType === "profile"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-lg ${
                selectedType === "profile"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Profile README
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Generate a GitHub profile README to showcase your work
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-500">
                <li>• About me section</li>
                <li>• Featured projects</li>
                <li>• GitHub stats widgets</li>
                <li>• Skills showcase</li>
              </ul>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
