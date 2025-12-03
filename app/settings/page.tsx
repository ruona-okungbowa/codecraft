"use client";

import { useState, useEffect, useRef } from "react";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import { createClient } from "@/lib/supabase/client";
import { Upload } from "lucide-react";

interface UserProfile {
  github_username: string;
  email?: string;
  avatar_url?: string;
  target_role?: string;
  first_name?: string;
  last_name?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [targetRole, setTargetRole] = useState("fullstack");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setTargetRole(data.target_role || "fullstack");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
        }),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        await fetchProfile();
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCareerPreferences() {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: targetRole,
        }),
      });

      if (response.ok) {
        alert("Career preferences updated successfully!");
        await fetchProfile();
      } else {
        alert("Failed to update preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleSyncGitHub() {
    setSyncing(true);
    try {
      const response = await fetch("/api/github/repos", { method: "POST" });
      if (response.ok) {
        const { showSuccess } = await import("@/lib/utils/toast");
        showSuccess("GitHub synced successfully!");
      } else {
        alert("Failed to sync GitHub");
      }
    } catch (error) {
      console.error("Error syncing GitHub:", error);
      alert("An error occurred");
    } finally {
      setSyncing(false);
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-uploads").getPublicUrl(filePath);

      // Update user profile
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      if (response.ok) {
        const { showSuccess } = await import("@/lib/utils/toast");
        showSuccess("Profile photo updated successfully!");
        await fetchProfile();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      const { showError } = await import("@/lib/utils/toast");
      showError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f6f7f8]">
        <CollapsibleSidebar />
        <main className="flex-1 p-8 ml-20 flex items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <CollapsibleSidebar />

      <main className="flex-1 p-8 md:p-12 ml-20">
        <div className="max-w-4xl mx-auto">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-3 pb-8">
            <div className="flex min-w-72 flex-col gap-3">
              <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em]">
                Settings
              </h1>
              <p className="text-slate-500 text-base font-normal leading-normal">
                Manage your account, preferences, and data.
              </p>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-lg p-6 mb-8 border border-slate-200">
            <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-5">
              Profile
            </h2>
            <div className="flex p-4 border-b border-slate-200 mb-6">
              <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <div className="flex gap-4 items-center">
                  {profile?.avatar_url ? (
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24"
                      style={{
                        backgroundImage: `url(${profile.avatar_url})`,
                      }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-slate-300" />
                  )}
                  <div className="flex flex-col justify-center">
                    <p className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                      Update your photo
                    </p>
                    <p className="text-slate-500 text-base font-normal leading-normal">
                      This will be displayed on your profile.
                    </p>
                  </div>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-10 px-4 bg-[#4c96e1] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="truncate">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span className="truncate">Upload Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
              <label className="flex flex-col">
                <p className="text-slate-900 text-base font-medium leading-normal pb-2">
                  First name
                </p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#4c96e1]/50 border border-slate-300 bg-[#f6f7f8] h-12 placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>
              <label className="flex flex-col">
                <p className="text-slate-900 text-base font-medium leading-normal pb-2">
                  Last name
                </p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#4c96e1]/50 border border-slate-300 bg-[#f6f7f8] h-12 placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
              <label className="flex flex-col">
                <p className="text-slate-900 text-base font-medium leading-normal pb-2">
                  Email
                </p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#4c96e1]/50 border border-slate-300 bg-[#f6f7f8] h-12 placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                  value={profile?.email || ""}
                  readOnly
                />
              </label>
              <label className="flex flex-col">
                <p className="text-slate-900 text-base font-medium leading-normal pb-2">
                  GitHub Username
                </p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-slate-500 focus:outline-0 border border-slate-300 bg-slate-100 h-12 p-3 text-base font-normal leading-normal cursor-not-allowed"
                  readOnly
                  value={profile?.github_username || ""}
                />
              </label>
            </div>
            <div className="flex justify-end pt-6 px-4">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#4c96e1] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors disabled:opacity-50"
              >
                <span className="truncate">
                  {saving ? "Saving..." : "Save Changes"}
                </span>
              </button>
            </div>
          </div>

          {/* Career Preferences Section */}
          <div className="bg-white rounded-lg p-6 mb-8 border border-slate-200">
            <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-5">
              Career Preferences
            </h2>
            <div className="px-4">
              <label className="flex flex-col max-w-md">
                <p className="text-slate-900 text-base font-medium leading-normal pb-2">
                  Target Role
                </p>
                <select
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#4c96e1]/50 border border-slate-300 bg-[#f6f7f8] h-12 p-3 text-base font-normal leading-normal"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="frontend">Frontend Developer</option>
                  <option value="fullstack">Full Stack Developer</option>
                  <option value="backend">Backend Developer</option>
                  <option value="devops">DevOps Engineer</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end pt-6 px-4">
              <button
                onClick={handleSaveCareerPreferences}
                disabled={saving}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#4c96e1] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors disabled:opacity-50"
              >
                <span className="truncate">
                  {saving ? "Saving..." : "Save Changes"}
                </span>
              </button>
            </div>
          </div>

          {/* GitHub Connection */}
          <div className="bg-white rounded-lg p-6 mb-8 border border-slate-200">
            <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-5">
              GitHub Connection
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 text-3xl">
                  verified
                </span>
                <div>
                  <p className="text-slate-900 font-medium">
                    Connected as{" "}
                    <span className="font-bold text-[#4c96e1]">
                      {profile?.github_username}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    Last synced: 5 minutes ago
                  </p>
                </div>
              </div>
              <button
                onClick={handleSyncGitHub}
                disabled={syncing}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#4c96e1] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors disabled:opacity-50"
              >
                <span className="truncate">
                  {syncing ? "Syncing..." : "Sync Now"}
                </span>
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">
              Session
            </h2>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-slate-200 rounded">
              <div>
                <p className="font-bold text-slate-900">Done For The Day?</p>
                <p className="text-sm text-slate-500 mt-1">
                  Sign out of your account securely
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-slate-100 text-slate-700 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
