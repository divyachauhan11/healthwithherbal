"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Camera, Check, Mail, Phone, Save, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { adminRequest, adminUploadRequest } from "../../../../lib/admin-api";

const dateText = (value) => value
  ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
  : "—";

export default function ProfilePage({ user, token, onUserUpdated }) {
  const [profile, setProfile] = useState(user || {});
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  useEffect(() => {
    let active = true;
    adminRequest("/profile", { token })
      .then(({ user: freshUser }) => {
        if (!active || !freshUser) return;
        setProfile(freshUser);
        setName(freshUser.name || "");
        setPhone(freshUser.phone || "");
      })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load your profile."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      let avatarFields = {};
      if (avatarFile) {
        const upload = await adminUploadRequest(avatarFile, { token });
        if (!upload.url) throw new Error("The profile photo upload did not return an image URL.");
        avatarFields = { avatarUrl: upload.url, avatarPublicId: upload.images?.[0]?.publicId || "" };
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

  const initials = (profile.name || "Admin").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const roleLabel = profile.role === "employee" ? "Team member" : "Administrator";
  const avatarUrl = !removeAvatar ? avatarPreview || profile.avatarUrl : "";

  const onSelectAvatar = (event) => {
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

  return (
    <section className="admin-profile-page">
      <div className="admin-profile-hero">
        <div className="admin-profile-avatar-wrap">
          <div className="admin-profile-avatar">{avatarUrl ? <img src={avatarUrl} alt="Profile" /> : initials}</div>
          <button className="admin-profile-photo-button" type="button" onClick={() => fileInputRef.current?.click()} disabled={saving} aria-label="Upload profile photo"><Camera size={15} /></button>
          <input ref={fileInputRef} className="admin-profile-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={onSelectAvatar} />
        </div>
        <div className="admin-profile-identity">
          <span className="admin-profile-eyebrow"><ShieldCheck size={14} /> ADMIN ACCOUNT</span>
          <h2>{profile.name || "Store administrator"}</h2>
          <p>{profile.email || user?.email || ""}</p>
        </div>
        <span className={`admin-profile-role ${profile.role === "employee" ? "team" : "admin"}`}>{roleLabel}</span>
      </div>

      <div className="admin-profile-content">
        <div className="admin-profile-form-card">
          <div className="admin-profile-section-heading">
            <div><h3>Personal details</h3><p>Update your profile photo, name, and contact number.</p></div>
            {profile.avatarUrl && !removeAvatar && <button type="button" className="admin-profile-remove-photo" onClick={() => { setAvatarFile(null); setRemoveAvatar(true); setMessage(""); }} disabled={saving}><Trash2 size={14} /> Remove photo</button>}
          </div>
          {error && <p className="admin-profile-feedback error" role="alert">{error}</p>}
          {message && <p className="admin-profile-feedback success" role="status">{message}</p>}
          <form onSubmit={saveProfile}>
            <label className="admin-profile-field"><span><UserRound size={15} /> Full name</span><input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" disabled={loading || saving} /></label>
            <label className="admin-profile-field"><span><Mail size={15} /> Email address</span><input type="email" value={profile.email || user?.email || ""} readOnly /><small>Email is managed by your administrator account.</small></label>
            <label className="admin-profile-field"><span><Phone size={15} /> Phone number</span><input type="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Add a contact number" disabled={loading || saving} /></label>
            <button className="primary admin-profile-save" type="submit" disabled={loading || saving}><Save size={16} />{saving ? "Saving…" : "Save changes"}</button>
          </form>
        </div>

        <aside className="admin-profile-info-card">
          <h3>Account information</h3>
          <div className="admin-profile-info-row"><span>Account type</span><b>{roleLabel}</b></div>
          <div className="admin-profile-info-row"><span>Account status</span><b className="admin-profile-active"><i /> Active</b></div>
          <div className="admin-profile-info-row"><span>Member since</span><b><CalendarDays size={14} /> {dateText(profile.createdAt)}</b></div>
          <div className="admin-profile-access">
            <span>Page access</span>
            <p>{profile.role === "admin" ? "Full admin portal access" : (profile.pageAccess || []).join(", ") || "No pages assigned"}</p>
          </div>
          <div className="admin-profile-session"><Check size={15} /> Signed in with a secure admin session</div>
        </aside>
      </div>
    </section>
  );
}
