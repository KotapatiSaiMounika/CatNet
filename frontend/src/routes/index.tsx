import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  Heart,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Blob,
  Butterfly,
  HeroCat,
  Magnifier,
  PawPrint,
  YarnBall,
  CatLogo,
} from "@/components/sections/CatIllustrations";
import { CatCard } from "@/components/cards/CatCard";
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/lib/posts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CatNet — Helping Every Cat Find Their Way Home" },
      {
        name: "description",
        content:
          "AI-powered lost & found and adoption platform for cats. Find your missing cat, report a found one, or adopt your new best friend.",
      },
    ],
  }),
  component: Landing,
});

function useCountUp(target: number, duration = 1600) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, val };
}

function Stat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { ref, val } = useCountUp(value);
  return (
    <div className="relative rounded-3xl bg-card/70 p-6 text-center shadow-soft backdrop-blur">
      <span
        ref={ref}
        className="block font-display text-4xl font-bold text-gradient md:text-5xl"
      >
        {val.toLocaleString()}
        {suffix}
      </span>
      <span className="mt-1 block text-sm font-semibold text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function Landing() {
  const { data: lostData } = useQuery({
  queryKey: ["home-lost"],
  queryFn: () =>
    postsApi.getPosts({
      category: "Lost",
      limit: 4,
    }),
});

const { data: adoptData } = useQuery({
  queryKey: ["home-adoption"],
  queryFn: () =>
    postsApi.getPosts({
      category: "Adoption",
      limit: 4,
    }),
});

const lostCats = lostData?.posts ?? [];
const adoptCats = adoptData?.posts ?? [];

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden pt-8 pb-24 md:pt-12">
        {/* floating blobs */}
        <Blob
          color="#F9C5D5"
          className="pointer-events-none absolute -left-32 top-10 h-[480px] w-[480px] opacity-60 animate-blob"
        />
        <Blob
          color="#D8C7FF"
          className="pointer-events-none absolute -right-32 top-32 h-[460px] w-[460px] opacity-50 animate-blob"
        />
        <Blob
          color="#D5F5E3"
          className="pointer-events-none absolute left-1/3 bottom-0 h-[320px] w-[320px] opacity-50 animate-blob"
        />

        {/* floating decorations */}
        <Butterfly className="pointer-events-none absolute right-[8%] top-32 h-14 w-14" />
        <YarnBall className="pointer-events-none absolute left-[6%] bottom-32 h-14 w-14 animate-spin-slow" />
        <PawPrint
          className="pointer-events-none absolute left-[20%] bottom-10 animate-paw"
          color="#FFD6BA"
        />
        <PawPrint
          className="pointer-events-none absolute right-[28%] bottom-20 animate-paw"
          color="#D8C7FF"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-Powered · 98% match accuracy
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Helping every cat <br />
              <span className="text-gradient">find their way home.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              CatNet uses gentle AI image matching, a kind global community, and
              real-time alerts to reunite lost cats with their humans — and help
              every stray find a forever home.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/lost"
                className="btn-bounce inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft"
              >
                Report Missing Cat <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/found"
                className="btn-bounce inline-flex items-center gap-2 rounded-full bg-card px-6 py-3.5 text-sm font-bold text-foreground shadow-soft"
              >
                Report Found Cat
              </Link>
              <Link
                to="/adoption"
                className="btn-bounce inline-flex items-center gap-2 rounded-full bg-secondary/70 px-6 py-3.5 text-sm font-bold text-secondary-foreground"
              >
                Browse Adoption <Heart className="h-4 w-4" />
              </Link>
            </div>

            {/* tiny social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["#FFD6BA", "#D8C7FF", "#D5F5E3", "#D6EEFF"].map((c, i) => (
                  <div
                    key={i}
                    style={{ background: c }}
                    className="grid h-10 w-10 place-items-center rounded-full border-2 border-white text-lg shadow-soft"
                  >
                    {["🐱", "😺", "😻", "😸"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">12,847</strong> cats reunited
                this year
              </p>
            </div>
          </div>

          {/* hero illustration */}
          <div className="relative">
            <div className="relative mx-auto aspect-square max-w-md">
              <HeroCat className="h-full w-full drop-shadow-2xl" />

              {/* floating cards */}
              <div className="absolute -left-4 top-1/4 rotate-[-6deg] rounded-2xl bg-card/95 p-3 shadow-float backdrop-blur animate-bounce-soft">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-mint">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Match found!</p>
                    <p className="text-[10px] text-muted-foreground">98% similarity</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-2 bottom-12 rotate-[5deg] rounded-2xl bg-card/95 p-3 shadow-float backdrop-blur">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-lavender">
                    <Bell className="h-4 w-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">2 new alerts</p>
                    <p className="text-[10px] text-muted-foreground">Near Brooklyn</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-2 left-10 rotate-[-3deg] rounded-2xl bg-card/95 p-3 shadow-float backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <p className="text-xs font-bold">
                    Mochi went home!
                    <span className="block text-[10px] font-normal text-muted-foreground">
                      2 minutes ago
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="mt-16 flex justify-center">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-1.5">
            <div className="h-2 w-1 rounded-full bg-muted-foreground animate-bounce-soft" />
          </div>
        </div>
      </section>

      {/* wave separator */}
      <svg viewBox="0 0 1440 80" className="block h-16 w-full text-card/60 fill-current">
        <path d="M0,40 C320,120 720,-40 1440,40 L1440,80 L0,80 Z" />
      </svg>

      {/* ---------------- STATS ---------------- */}
      <section className="bg-card/60 py-16 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Stat value={12847} label="Cats Reunited" />
            <Stat value={8421} label="Cats Adopted" />
            <Stat value={3206} label="Cats Rescued" />
            <Stat value={4280} label="Volunteers" />
            <Stat value={186} label="Communities" />
            <Stat value={94} label="Success Rate" suffix="%" />
          </div>
        </div>
      </section>

      {/* ---------------- AI DEMO ---------------- */}
      <section className="relative overflow-hidden py-24">
        <Blob
          color="#D6EEFF"
          className="pointer-events-none absolute -right-32 top-10 h-[420px] w-[420px] opacity-60 animate-blob"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-lavender/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-900">
              <ScanSearch className="h-3.5 w-3.5" /> AI Matching
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
              Upload a photo. Our gentle AI does the rest.
            </h2>
            <p className="mt-4 text-muted-foreground">
              CatNet's matching engine compares fur patterns, ear shapes, eye
              colors, and whisker counts to find the closest possible matches in
              seconds — across thousands of nearby reports.
            </p>

            <div className="mt-6 space-y-3">
              {[
                { step: "1", text: "Upload missing cat photo" },
                { step: "2", text: "AI scans nearby database" },
                { step: "3", text: "Review top matches with confidence scores" },
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex items-center gap-4 rounded-2xl bg-card/80 p-4 shadow-soft"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full gradient-primary font-bold text-primary-foreground">
                    {s.step}
                  </span>
                  <p className="text-sm font-semibold">{s.text}</p>
                </div>
              ))}
            </div>

            <Link
              to="/ai-match"
              className="btn-bounce mt-8 inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
            >
              Try AI Match <Sparkles className="h-4 w-4" />
            </Link>
          </div>

          {/* AI demo visual */}
          <div className="relative rounded-3xl bg-card/80 p-6 shadow-card backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-pink-200 to-orange-200">
                <div className="absolute inset-0 grid place-items-center text-7xl">
                  🐱
                </div>
                <div className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold">
                  Your cat
                </div>
                {/* scan line */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-glow animate-bounce-soft" />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-purple-200 to-pink-200">
                <div className="absolute inset-0 grid place-items-center text-7xl">
                  😺
                </div>
                <div className="absolute left-2 top-2 rounded-full bg-mint/90 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                  98% match
                </div>
                {/* similarity ring */}
                <svg className="absolute right-2 bottom-2 h-12 w-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="4" fill="none" opacity="0.5" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#5DBB7E"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${0.98 * 125.6} 125.6`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-mint/30 p-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Fur pattern</span>
                <span className="text-emerald-700">96%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-card/70">
                <div className="h-full w-[96%] rounded-full gradient-primary" />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                <span>Eye color</span>
                <span className="text-emerald-700">99%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-card/70">
                <div className="h-full w-[99%] rounded-full gradient-primary" />
              </div>
            </div>

            {/* peeking cat */}
            <div className="absolute -right-4 -top-8 animate-peek">
              <Magnifier className="h-20 w-20" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-peach/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
              Features
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              Everything a cat could ask for
            </h2>
            <p className="mt-4 text-muted-foreground">
              A cozy toolkit built with love — for the cats and the humans who
              care for them.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ScanSearch,
                title: "AI Image Matching",
                desc: "Compares fur patterns, eyes, and ears for accurate identification.",
                bg: "bg-pink-100 dark:bg-pink-400/20",
                emoji: "🔍",
              },
              {
                icon: MapPin,
                title: "Location Search",
                desc: "Find cats and reports near you with a beautiful pastel map.",
                bg: "bg-blue-100 dark:bg-blue-400/20",
                emoji: "📍",
              },
              {
                icon: Heart,
                title: "Adoption",
                desc: "Pinterest-style adoption gallery with personality matching.",
                bg: "bg-purple-100 dark:bg-purple-400/20",
                emoji: "💖",
              },
              {
                icon: Users,
                title: "Volunteer Network",
                desc: "Connect with rescuers, shelters, and feeding stations nearby.",
                bg: "bg-green-100 dark:bg-green-400/20",
                emoji: "🤝",
              },
              {
                icon: Bell,
                title: "Real-time Alerts",
                desc: "Push notifications the moment a possible match appears.",
                bg: "bg-orange-100 dark:bg-orange-400/20",
                emoji: "🔔",
              },
              {
                icon: ShieldCheck,
                title: "Verified Reunions",
                desc: "Owner verification keeps every reunion safe and sound.",
                bg: "bg-yellow-100 dark:bg-yellow-400/20",
                emoji: "🛡️",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="hover-lift group relative overflow-hidden rounded-3xl bg-card/85 p-6 shadow-soft"
              >
                <div className={`grid h-14 w-14 place-items-center rounded-2xl ${f.bg}`}>
                  <f.icon className="h-6 w-6 text-foreground/80" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                <span className="absolute -right-3 -top-3 text-5xl opacity-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
                  {f.emoji}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="relative overflow-hidden gradient-soft py-24">
        <Butterfly className="pointer-events-none absolute right-[10%] top-12 h-12 w-12" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-card/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-soft">
              How it works
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              From lost to loved in 5 cozy steps
            </h2>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-5">
            {[
              { n: 1, t: "Upload Cat", e: "📸" },
              { n: 2, t: "AI Analysis", e: "🧠" },
              { n: 3, t: "Similar Matches", e: "💞" },
              { n: 4, t: "Verify Owner", e: "🛡️" },
              { n: 5, t: "Happy Reunion", e: "🏡" },
            ].map((s) => (
              <li
                key={s.n}
                className="relative rounded-3xl bg-card/85 p-6 text-center shadow-soft"
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 grid h-9 w-9 place-items-center rounded-full gradient-primary text-sm font-bold text-primary-foreground shadow-soft">
                  {s.n}
                </span>
                <div className="mt-3 text-4xl">{s.e}</div>
                <p className="mt-3 font-bold">{s.t}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- LOST CATS ---------------- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="rounded-full bg-coral/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-coral">
                Recently lost
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
                Help these cats find their way home
              </h2>
            </div>
            <Link
              to="/lost"
              className="btn-bounce inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-bold text-foreground shadow-soft"
            >
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {lostCats.map((post) => (
  <CatCard key={post._id} cat={post} />
))}
          </div>
        </div>
      </section>

      {/* ---------------- ADOPTION ---------------- */}
      <section className="relative overflow-hidden bg-card/60 py-24">
        <YarnBall className="pointer-events-none absolute left-6 top-12 h-14 w-14 animate-spin-slow" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="rounded-full bg-lavender/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-900">
                Adopt me
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
                Soft hearts waiting for a forever home
              </h2>
            </div>
            <Link
              to="/adoption"
              className="btn-bounce inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-bold text-foreground shadow-soft"
            >
              Browse all <Heart className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {adoptCats.map((post) => (
  <CatCard key={post._id} cat={post} />
))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="relative overflow-hidden py-24">
        <Blob
          color="#FFD6BA"
          className="pointer-events-none absolute -left-20 top-10 h-[380px] w-[380px] opacity-60 animate-blob"
        />
        <Blob
          color="#F9C5D5"
          className="pointer-events-none absolute -right-20 bottom-10 h-[380px] w-[380px] opacity-60 animate-blob"
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-card/90 shadow-soft">
            <CatLogo size={72} />
          </div>
          <h2 className="font-display text-4xl font-bold md:text-6xl">
            Every cat deserves a <span className="text-gradient">happy ending.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Join 4,280 volunteers and a community of cat-lovers turning lost
            stories into reunions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/lost"
              className="btn-bounce rounded-full gradient-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-soft"
            >
              Report a missing cat
            </Link>
            <Link
              to="/community"
              className="btn-bounce rounded-full bg-card px-7 py-3.5 text-sm font-bold text-foreground shadow-soft"
            >
              Join the community
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}