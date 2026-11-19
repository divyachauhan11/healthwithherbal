import { Mail, Phone, Save, Trash2, UserRound } from "lucide-react";

export function ProfileDetailsForm({
  profile,
  user,
  name,
  setName,
  phone,
  setPhone,
  loading,
  saving,
  message,
  error,
  onSubmit,
  canRemoveAvatar,
  onRemoveAvatar,
}) {
  return (
    <div className="admin-profile-form-card">
      <div className="admin-profile-section-heading">
        <div>
          <h3>Personal details</h3>
          <p>Update your profile photo, name, and contact number.</p>
        </div>
        {canRemoveAvatar && (
          <button
            type="button"
            className="admin-profile-remove-photo"
            onClick={onRemoveAvatar}
            disabled={saving}
          >
            <Trash2 size={14} /> Remove photo
          </button>
        )}
      </div>
      {error && (
        <p className="admin-profile-feedback error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="admin-profile-feedback success" role="status">
          {message}
        </p>
      )}
      <form onSubmit={onSubmit}>
        <label className="admin-profile-field">
          <span><UserRound size={15} /> Full name</span>
          <input
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            disabled={loading || saving}
          />
        </label>
        <label className="admin-profile-field">
          <span><Mail size={15} /> Email address</span>
          <input type="email" value={profile.email || user?.email || ""} readOnly />
          <small>Email is managed by your administrator account.</small>
        </label>
        <label className="admin-profile-field">
          <span><Phone size={15} /> Phone number</span>
          <input
            type="tel"
            maxLength={30}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Add a contact number"
            disabled={loading || saving}
          />
        </label>
        <button
          className="primary admin-profile-save"
          type="submit"
          disabled={loading || saving}
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
