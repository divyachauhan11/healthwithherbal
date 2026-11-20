/**
 * Admin portal frame: sidebar, main column (header + page content) and the
 * overlays (dialogs, toast) rendered after it.
 * @param {object} props
 * @param {import("react").ReactNode} props.sidebar
 * @param {import("react").ReactNode} props.header
 * @param {import("react").ReactNode} props.overlays
 * @param {import("react").ReactNode} props.children Page content.
 */
export function AdminPortalShell({ sidebar, header, overlays, children }) {
  return (
    <div className="app admin-app">
      {sidebar}
      <main>
        {header}
        <div className="content">{children}</div>
      </main>
      {overlays}
    </div>
  );
}
