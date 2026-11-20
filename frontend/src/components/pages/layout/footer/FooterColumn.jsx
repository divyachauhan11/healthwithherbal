"use client";

/**
 * Titled footer link column.
 * @param {{title: string, children: React.ReactNode}} props
 */
export function FooterColumn({ title, children }) {
  return (
    <div>
      <h4>{title}</h4>
      {children}
    </div>
  );
}
