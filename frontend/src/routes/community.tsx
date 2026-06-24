import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — CatNet" },
      {
        name: "description",
        content: "Reunion stories, rescues, and the kindest humans on the internet.",
      },
    ],
  }),
  component: Community,
});

const posts = [
  {
    name: "Sara K.",
    avatar: "😺",
    bg: "from-pink-200 to-orange-200",
    time: "2h ago",
    text: "After 8 days missing, our Mochi is finally home! CatNet matched her in 3 hours. 💖",
    image: "🐱",
    imageBg: "from-pink-200 to-purple-200",
    likes: 412,
    comments: 38,
    tag: "Reunion",
  },
  {
    name: "Brooklyn Rescue",
    avatar: "🐾",
    bg: "from-purple-200 to-blue-200",
    time: "5h ago",
    text: "Big rescue today — 6 kittens safe and warm. Looking for foster homes 🥺",
    image: "😻",
    imageBg: "from-yellow-200 to-pink-200",
    likes: 891,
    comments: 124,
    tag: "Rescue",
  },
  {
    name: "Liam J.",
    avatar: "😸",
    bg: "from-green-200 to-blue-200",
    time: "1d ago",
    text: "Volunteered at the feeding station today. Look at these little floofs!",
    image: "🙀",
    imageBg: "from-blue-200 to-purple-200",
    likes: 256,
    comments: 19,
    tag: "Volunteer",
  },
];

function Community() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        title={
          <>
            The kindest <span className="text-gradient">corner of the internet.</span>
          </>
        }
        description="Real reunions, rescue stories, and tiny everyday wins from the CatNet community."
      />

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {posts.map((p, i) => (
            <article key={i} className="hover-lift overflow-hidden rounded-3xl bg-white/85 shadow-card">
              <header className="flex items-center gap-3 p-5">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${p.bg} text-xl`}>
                  {p.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.time}</p>
                </div>
                <span className="ml-auto rounded-full bg-secondary/60 px-3 py-1 text-[11px] font-bold text-secondary-foreground">
                  {p.tag}
                </span>
              </header>
              <p className="px-5 pb-4 text-[15px]">{p.text}</p>
              <div className={`mx-5 mb-5 grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${p.imageBg} text-8xl`}>
                {p.image}
              </div>
              <footer className="flex items-center gap-5 border-t border-border/60 px-5 py-3 text-sm text-muted-foreground">
                <button className="flex items-center gap-1.5 hover:text-coral">
                  <Heart className="h-4 w-4" /> {p.likes}
                </button>
                <button className="flex items-center gap-1.5 hover:text-foreground">
                  <MessageCircle className="h-4 w-4" /> {p.comments}
                </button>
                <button className="ml-auto flex items-center gap-1.5 hover:text-foreground">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </footer>
            </article>
          ))}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white/85 p-5 shadow-card">
            <h3 className="font-display text-lg font-bold">Trending tags</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {["#reunion", "#rescue", "#kittens", "#foster", "#happytails", "#strays"].map((t) => (
                <span key={t} className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-bold text-secondary-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white/85 p-5 shadow-card">
            <h3 className="font-display text-lg font-bold">Upcoming events</h3>
            <ul className="mt-3 space-y-3 text-sm">
              {[
                { d: "Sat", n: "Adoption fair", p: "Prospect Park" },
                { d: "Sun", n: "Vet drive", p: "Mission St." },
                { d: "Fri", n: "Volunteer night", p: "Online" },
              ].map((e) => (
                <li key={e.n} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-peach/60 text-xs font-bold">
                    {e.d}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{e.n}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.p}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
