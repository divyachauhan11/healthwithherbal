import { Camera, ShieldCheck } from "lucide-react";

export function ProfileHero({
  profile,
  user,
  roleLabel,
  initials,
  avatarUrl,
  fileInputRef,
  onSelectAvatar,
  saving,
}) {
  return (
    <div className="admin-profile-hero">
      <div className="admin-profile-avatar-wrap">
        <div className="admin-profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="Profile" /> : initials}
        </div>
        <button
          className="admin-profile-photo-button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
          aria-label="Upload profile photo"
        >
          <Camera size={15} />
        </button>
        <input
          ref={fileInputRef}
          className="admin-profile-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={onSelectAvatar}
        />
      </div>
      <div className="admin-profile-identity">
        <span className="admin-profile-eyebrow">
          <ShieldCheck size={14} /> ADMIN ACCOUNT
        </span>
        <h2>{profile.name || "Store administrator"}</h2>
        <p>{profile.email || user?.email || ""}</p>
      </div>
      <span
        className={`admin-profile-role ${profile.role === "employee" ? "team" : "admin"}`}
      >
        {roleLabel}
      </span>
    </div>
  );
}
