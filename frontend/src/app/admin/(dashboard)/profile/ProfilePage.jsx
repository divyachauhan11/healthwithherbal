export default function ProfilePage({ user }) {
  return (
    <section className="panel customer-profile">
      <div className="profile-hero">
        <div className="avatar large">
          {(user?.name || "Admin").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3>{user?.name || "Store administrator"}</h3>
          <p>{user?.email}</p>
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <span>Role</span>
          <b>Administrator</b>
        </div>
        <div>
          <span>Session</span>
          <b>Secure · expires in 8 hours</b>
        </div>
        <div>
          <span>Store</span>
          <b>Healthwithherbal</b>
        </div>
        <div>
          <span>Database</span>
          <b>MongoDB connected</b>
        </div>
      </div>
    </section>
  );
}
