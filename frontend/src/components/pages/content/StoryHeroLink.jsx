import { ArrowRight } from "lucide-react";

/** "Discover our purpose" anchor of the Our Story hero; jumps to the purpose card. */
export function StoryHeroLink() {
  return (
    <a className="story-hero-link" href="#story-purpose">
      Discover our purpose <ArrowRight size={16} />
    </a>
  );
}
