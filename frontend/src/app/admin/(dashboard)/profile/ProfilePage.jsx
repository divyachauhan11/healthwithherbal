"use client";

import {
  ProfileAccountInfo,
  ProfileDetailsForm,
  ProfileHero,
  useAdminProfile,
} from "@/components/admin/profile";

/**
 * Profile page for the signed-in admin: photo and identity, editable personal details
 * and account information.
 */
export default function ProfilePage({ user, token, onUserUpdated }) {
  const {
    profile,
    name,
    setName,
    phone,
    setPhone,
    loading,
    saving,
    message,
    error,
    initials,
    roleLabel,
    avatarUrl,
    canRemoveAvatar,
    fileInputRef,
    saveProfile,
    selectAvatar,
    removeProfilePhoto,
  } = useAdminProfile({ user, token, onUserUpdated });

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
          canRemoveAvatar={canRemoveAvatar}
          onRemoveAvatar={removeProfilePhoto}
        />
        <ProfileAccountInfo profile={profile} roleLabel={roleLabel} />
      </div>
    </section>
  );
}
