import { createFileRoute } from "@tanstack/react-router";
import { Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { CatLogo } from "@/components/sections/CatIllustrations";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CatNet" },
      {
        name: "description",
        content: "Our mission: reunite every lost cat and help every stray find a forever home.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            We're building <span className="text-gradient">a kinder internet</span><br />for cats.
          </>
        }
        description="CatNet started as a weekend project to help find a neighbor's lost kitten. Today it's a global community using AI and kindness to reunite, rescue, and rehome cats everywhere."
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Heart, title: "Mission", text: "Every cat home. Every story happy." },
            { icon: Sparkles, title: "Tech", text: "Gentle AI tuned for fur patterns, not faces." },
            { icon: ShieldCheck, title: "Safety", text: "Verified reunions and protected privacy." },
          ].map((v) => (
            <div key={v.title} className="rounded-3xl bg-white/85 p-6 shadow-card hover-lift">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-pink-100">
                <v.icon className="h-5 w-5 text-foreground/80" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-3xl gradient-soft p-10 text-center shadow-soft">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/90 shadow-soft">
            <CatLogo size={56} />
          </div>
          <h2 className="mt-5 font-display text-3xl font-bold md:text-4xl">
            Built with love by 28 cat-people, in 12 cities.
          </h2>
          <p className="mt-4 text-muted-foreground">
            <Users className="-mt-0.5 mr-1 inline h-4 w-4" /> Designers, engineers,
            vets, and volunteers — all united by one cause.
          </p>
        </div>
      </section>
    </>
  );
}
