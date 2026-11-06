"use client";
import { HeartHandshake, Leaf, Star, Users } from "lucide-react";
export function WhyHealthWithHerbal() {
    const points = [
        {
            title: "Happy Seekers",
            glow: "glow-amber",
            icon: (<div className="why-badge users">
          <div className="why-mini-stars">
            <Star size={11} fill="#e59828" color="#e59828"/>
            <Star size={11} fill="#e59828" color="#e59828"/>
            <Star size={11} fill="#e59828" color="#e59828"/>
          </div>
          <Users size={28}/>
        </div>),
            text: (<>
          More than <strong>25,000+</strong> wellness lovers have given us <strong>5 stars</strong>.
        </>),
        },
        {
            title: "Pure & Tested Botanicals",
            glow: "glow-blue",
            icon: (<div className="why-badge leaf">
          <Leaf size={28}/>
        </div>),
            text: (<>
          Health with Herbal uses <strong>100% genuine</strong> ingredients tested for purity and zero harsh chemicals.
        </>),
        },
        {
            title: "Rooted & Sustainable",
            glow: "glow-teal",
            icon: (<div className="why-badge tree">
          <HeartHandshake size={28}/>
        </div>),
            text: (<>
          We have supported <strong>500+ heritage growers</strong> with fair-trade and conscious sourcing.
        </>),
        },
    ];
    return (<section className="why-section">
      <div className="page-width">
        <div className="why-heading">
          <h2>Why Health with Herbal</h2>
          <p>Rooted, loved, and trusted.</p>
        </div>

        <div className="why-grid">
          {points.map((item, idx) => (<div key={idx} className={`why-card ${item.glow}`}>
              <div className="why-card-top">
                <h3>{item.title}</h3>
                {item.icon}
              </div>
              <p className="why-card-text">{item.text}</p>
            </div>))}
        </div>

        <p className="why-disclaimer">
          *Ratings and customer feedback verified across Health with Herbal store and verified customer reviews.
        </p>
      </div>
    </section>);
}
