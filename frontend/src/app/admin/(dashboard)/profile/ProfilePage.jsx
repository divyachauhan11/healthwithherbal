"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminRequest, adminUploadRequest } from "@/lib/admin-api";
import { useAsyncResource } from "@/hooks";
import { ProfileAccountInfo } from "@/components/admin/profile/ProfileAccountInfo";
import { ProfileDetailsForm } from "@/components/admin/profile/ProfileDetailsForm";
import { ProfileHero } from "@/components/admin/profile/ProfileHero";

export default function ProfilePage({ user, token, onUserUpdated }) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const loadProfile = useCallback(
    () => adminRequest("/profile", { token }).then(({ user: freshUser }) => freshUser),
    [token],
  );
  const applyLoadedProfile = useCallback((freshUser) => {
    if (!freshUser) return;
    setName(freshUser.name || "");
    setPhone(freshUser.phone || "");
  }, []);
  const {
    data: profile,
    setData: setProfile,
    loading,
    error,
    setError,
  } = useAsyncResource({
    load: loadProfile,
    deps: [token],
    enabled: true,
    initialData: user || {},
    setUndefinedData: false,
    errorMessage: (requestError) => requestError.message || "Could not load your profile.",
    onSuccess: applyLoadedProfile,
  });

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      let avatarFields = {};
      if (avatarFile) {
        const upload = await adminUploadRequest(avatarFile, { token });
        if (!upload.url) {
          throw new Error("The profile photo upload did not return an image URL.");
        }
        avatarFields = {
          avatarUrl: upload.url,
          avatarPublicId: upload.images?.[0]?.publicId || "",
        };
      } else if (removeAvatar) {
        avatarFields = { avatarUrl: "", avatarPublicId: "" };
      }

      const result = await adminRequest("/profile", {
        token,
        method: "PATCH",
        body: { name, phone, ...avatarFields },
      });
      setProfile(result.user);
      setName(result.user.name || "");
      setPhone(result.user.phone || "");
      setAvatarFile(null);
      setRemoveAvatar(false);
      onUserUpdated?.(result.user);
      setMessage("Your profile was saved.");
    } catch (requestError) {
      setError(requestError.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile.name || "Admin")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const roleLabel = profile.role === "employee" ? "Team member" : "Administrator";
  const avatarUrl = !removeAvatar ? avatarPreview || profile.avatarUrl : "";

  const selectAvatar = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setError("Choose a JPG, PNG, WebP, or AVIF image for your profile photo.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photos must be 5 MB or smaller.");
      return;
    }
    setError("");
    setMessage("");
    setAvatarFile(file);
    setRemoveAvatar(false);
  };

  const removeProfilePhoto = () => {
    setAvatarFile(null);
    setRemoveAvatar(true);
    setMessage("");
  };

  return (
    <section className="admin-profile-page">
      <ProfileHero
        profile={profile}
        user={user}
        roleLabel={roleLabel}
        initials={initials}
        avatarUrl={avatarUrl}
        fileInputRef={fileInputRef}
        onSelectAvatar={selectAvatar}
        saving={saving}
      />
      <div className="admin-profile-content">
        <ProfileDetailsForm
          profile={profile}
          user={user}
          name={name}
          setName={setName}
          phone={phone}
          setPhone={setPhone}
          loading={loading}
          saving={saving}
          message={message}
          error={error}
          onSubmit={saveProfile}
          canRemoveAvatar={Boolean(profile.avatarUrl && !removeAvatar)}
          onRemoveAvatar={removeProfilePhoto}
        />
        <ProfileAccountInfo profile={profile} roleLabel={roleLabel} />
      </div>
    </section>
  );
}
