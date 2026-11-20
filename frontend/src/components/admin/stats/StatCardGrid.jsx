import { StatCard } from "../global/StatCard";

/**
 * Row of stat cards at the top of an admin page.
 * @param {{cards: Array<Object>}} props StatCard props, each with a unique `id`.
 */
export function StatCardGrid({ cards }) {
  return (
    <section className="page-stats">
      {cards.map((c) => (
        <StatCard key={c.id} {...c} />
      ))}
    </section>
  );
}
