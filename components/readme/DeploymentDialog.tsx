"use client";

import { useState } from "react";
import {
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface DeploymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: () => Promise<void>;
  type: "project" | "profile";
  repoName?: string;
}

export default function DeploymentDialog({
  isOpen,
  onClose,
  onDeploy,
  type,
  repoName,
}: DeploymentDialogProps) {
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);

    try {
      await onDeploy();
      setDeployed(true);
      // In a real implementation, you'd get the URL from the API response
      setDeploymentUrl(
        type === "project"
          ? `https://github.com/${repoName}#readme`
          : `https://github.com/${repoName}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    setDeployed(false);
    setError(null);
    setDeploymentUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Deploy to GitHub
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!deployed && !error && (
            <>
              <p className="text-gray-600 mb-4">
                This will create or update the README.md file in your{" "}
                {type === "project" ? "repository" : "profile repository"}.
              </p>
              {type === "profile" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> If your profile repository (
                    {repoName}/{repoName}) doesn&apos;t exist, it will be
                    created automatically.
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Repository:</strong>{" "}
                  {type === "project" ? repoName : `${repoName}/${repoName}`}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Commit message:</strong> &quot;docs: update README via
                  GitStory&quot;
                </p>
              </div>
            </>
          )}

          {deployed && deploymentUrl && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Successfully Deployed!
              </h4>
              <p className="text-gray-600 mb-4">
                Your README has been deployed to GitHub.
              </p>
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Deployment Failed
              </h4>
              <p className="text-gray-600 mb-4">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          {!deployed && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={deploying}
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Deploy</span>
                  </>
                )}
              </button>
            </>
          )}
          {deployed && (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          )}
          {error && (
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
