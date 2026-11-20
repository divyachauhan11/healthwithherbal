"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminUploadRequest, fetchAdminProfile, updateAdminProfile } from "@/lib/admin-api";
import { useAsyncResource } from "@/hooks";
import { getAvatarFileError, getProfileInitials, getProfileRoleLabel } from "./profile-utils";

/**
 * Owns the signed-in admin's profile: loading it, the editable name/phone, the profile
 * photo (preview, upload, removal) and saving.
 * @param {{user?: object, token: string, onUserUpdated?: (user: object) => void}} options
 * @returns {{
 *   profile: object, name: string, setName: Function, phone: string, setPhone: Function,
 *   loading: boolean, saving: boolean, message: string, error: string,
 *   initials: string, roleLabel: string, avatarUrl: string, canRemoveAvatar: boolean,
 *   fileInputRef: {current: HTMLInputElement|null}, saveProfile: (event: Event) => Promise<void>,
 *   selectAvatar: (event: Event) => void, removeProfilePhoto: () => void
 * }}
 */
export function useAdminProfile({ user, token, onUserUpdated }) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const loadProfile = useCallback(
    () => fetchAdminProfile(token).then(({ user: freshUser }) => freshUser),
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

      const result = await updateAdminProfile({ name, phone, ...avatarFields }, token);
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

  const selectAvatar = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const fileError = getAvatarFileError(file);
    if (fileError) {
      setError(fileError);
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

  return {
    profile,
    name,
    setName,
    phone,
    setPhone,
    loading,
    saving,
    message,
    error,
    initials: getProfileInitials(profile.name),
    roleLabel: getProfileRoleLabel(profile.role),
    avatarUrl: !removeAvatar ? avatarPreview || profile.avatarUrl : "",
    canRemoveAvatar: Boolean(profile.avatarUrl && !removeAvatar),
    fileInputRef,
    saveProfile,
    selectAvatar,
    removeProfilePhoto,
  };
}
