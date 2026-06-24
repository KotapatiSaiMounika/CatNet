import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/sections/PageHero";
import { PawPrint } from "@/components/sections/CatIllustrations";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map — CatNet" },
      { name: "description", content: "Beautiful pastel map of nearby cats, shelters, and rescuers." },
    ],
  }),
  component: MapPage,
});

const pins = [
  { x: 22, y: 28, e: "🐱", c: "bg-coral", label: "Lost" },
  { x: 60, y: 34, e: "😺", c: "bg-mint", label: "Found" },
  { x: 75, y: 60, e: "😻", c: "bg-lavender", label: "Adopt" },
  { x: 30, y: 65, e: "🏠", c: "bg-peach", label: "Shelter" },
  { x: 48, y: 50, e: "🩺", c: "bg-sky", label: "Vet" },
  { x: 84, y: 22, e: "🥣", c: "bg-mint", label: "Feeding" },
  { x: 14, y: 75, e: "🤝", c: "bg-lavender", label: "Volunteer" },
];

function MapPage() {
  return (
    <>
      <PageHero
        eyebrow="Map"
        title={<>Cats and helpers, <span className="text-gradient">all on one map.</span></>}
        description="A live, pastel-soft map showing lost cats, found cats, shelters, vets, and feeding stations near you."
      />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl bg-white/85 p-5 shadow-card">
            <h3 className="font-display text-lg font-bold">Layers</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: "Missing cats", color: "bg-coral" },
                { label: "Found cats", color: "bg-mint" },
                { label: "Adoption", color: "bg-lavender" },
                { label: "Shelters", color: "bg-peach" },
                { label: "Vets", color: "bg-sky" },
                { label: "Feeding stations", color: "bg-mint" },
                { label: "Volunteers", color: "bg-lavender" },
              ].map((l) => (
                <li key={l.label} className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${l.color}`} />
                  <span>{l.label}</span>
                  <input type="checkbox" defaultChecked className="ml-auto accent-pink-400" />
                </li>
              ))}
            </ul>
          </aside>

          <div className="relative overflow-hidden rounded-3xl shadow-card">
            {/* faux pastel map */}
            <div className="relative aspect-[16/10] gradient-soft">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <path d="M0,40 Q20,30 35,45 T70,40 T100,50" stroke="#D6EEFF" strokeWidth="3" fill="none" />
                <path d="M10,70 Q30,80 50,65 T90,72" stroke="#D5F5E3" strokeWidth="3" fill="none" />
                <circle cx="50" cy="55" r="22" fill="#F9C5D5" opacity="0.18" />
                <circle cx="22" cy="30" r="14" fill="#D8C7FF" opacity="0.2" />
                <rect x="60" y="15" width="20" height="20" rx="4" fill="#FFD6BA" opacity="0.25" />
                <rect x="14" y="62" width="24" height="22" rx="4" fill="#D5F5E3" opacity="0.25" />
              </svg>

              {pins.map((p, i) => (
                <div
                  key={i}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-full"
                >
                  <div className={`grid h-11 w-11 place-items-center rounded-full ${p.c} text-xl shadow-soft animate-bounce-soft`}>
                    {p.e}
                  </div>
                  <div className={`mx-auto -mt-0.5 h-2 w-2 rotate-45 ${p.c}`} />
                </div>
              ))}

              <PawPrint className="pointer-events-none absolute bottom-6 left-1/3 animate-paw" color="#D8C7FF" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
