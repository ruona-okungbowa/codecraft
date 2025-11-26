"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Github,
  Briefcase,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogOut,
  Trash2,
  Shield,
} from "lucide-react";
import { Newsreader, Sansation } from "next/font/google";
import DashboardSidebar from "@/components/DashboardSidebar";
import Image from "next/image";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

type TargetRole = "frontend" | "backend" | "fullstack" | "devops" | null;

interface UserProfile {
  github_username: string;
  email?: string;
  avatar_url?: string;
  target_role?: TargetRole;
  first_name?: string;
  last_name?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Form state
  const [targetRole, setTargetRole] = useState<TargetRole>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setTargetRole(data.target_role || null);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: targetRole,
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
        }),
      });

      if (response.ok) {
        setSaveStatus({
          type: "success",
          message: "Settings saved successfully!",
        });
        await fetchProfile();
      } else {
        const data = await response.json();
        setSaveStatus({
          type: "error",
          message: data.error || "Failed to save settings",
        });
      }
    } catch {
      setSaveStatus({
        type: "error",
        message: "An error occurred while saving",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 5000);
    }
  }

  async function handleLogout() {
    window.location.href = "/api/auth/logout";
  }

  const roles = [
    {
      value: "frontend" as TargetRole,
      label: "Frontend Developer",
      description: "React, Vue, Angular, UI/UX",
    },
    {
      value: "backend" as TargetRole,
      label: "Backend Developer",
      description: "APIs, Databases, Server-side",
    },
    {
      value: "fullstack" as TargetRole,
      label: "Full Stack Developer",
      description: "Frontend + Backend",
    },
    {
      value: "devops" as TargetRole,
      label: "DevOps Engineer",
      description: "CI/CD, Cloud, Infrastructure",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="ml-[72px] flex-1 flex items-center justify-center">
          <Loader2 size={48} className="text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-[72px] flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-10 py-6">
            <h1
              className={`text-[28px] font-bold text-gray-900 ${newsreader.className}`}
            >
              Settings
            </h1>
            <p className={`text-sm text-gray-600 mt-1 ${sansation.className}`}>
              Manage your account and preferences
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-10 py-8 max-w-4xl mx-auto">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-gray-700" />
              <h2
                className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
              >
                Profile Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used in portfolio and resume
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used in portfolio and resume
                  </p>
                </div>
              </div>

              {/* Avatar & Username */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <User size={32} className="text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Github size={16} className="text-gray-600" />
                    <span className="font-semibold text-gray-900">
                      {profile?.github_username}
                    </span>
                  </div>
                  {profile?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* GitHub Connection Status */}
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">
                      GitHub Connected
                    </p>
                    <p className="text-sm text-green-700">
                      Your account is linked to GitHub
                    </p>
                  </div>
                </div>
                <Shield size={20} className="text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Career Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Briefcase size={20} className="text-gray-700" />
              <h2
                className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
              >
                Career Preferences
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Role
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Select your target role to get personalized skill gap analysis
                  and project recommendations
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => setTargetRole(role.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        targetRole === role.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`font-semibold ${
                            targetRole === role.value
                              ? "text-blue-900"
                              : "text-gray-900"
                          }`}
                        >
                          {role.label}
                        </span>
                        {targetRole === role.value && (
                          <CheckCircle size={20} className="text-blue-600" />
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          targetRole === role.value
                            ? "text-blue-700"
                            : "text-gray-600"
                        }`}
                      >
                        {role.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <div className="flex-1">
              {saveStatus.type && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-2 ${
                    saveStatus.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {saveStatus.type === "success" ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <span className="text-sm font-medium">
                    {saveStatus.message}
                  </span>
                </motion.div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-xl border border-red-200 shadow-sm p-6"
          >
            <h2
              className={`text-xl font-bold text-red-900 mb-4 ${newsreader.className}`}
            >
              Danger Zone
            </h2>

            <div className="space-y-4">
              {/* Logout */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Log Out</p>
                  <p className="text-sm text-gray-600">
                    Sign out of your account
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="font-medium text-red-900">Delete Account</p>
                  <p className="text-sm text-red-700">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button
                  onClick={() =>
                    alert(
                      "Account deletion is not yet implemented. Please contact support."
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Trash2 size={18} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
