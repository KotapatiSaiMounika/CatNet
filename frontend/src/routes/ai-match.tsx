import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Upload, ImagePlus } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Magnifier } from "@/components/sections/CatIllustrations";

export const Route = createFileRoute("/ai-match")({
  head: () => ({
    meta: [
      { title: "AI Match — CatNet" },
      {
        name: "description",
        content:
          "Upload a photo and let CatNet's AI find the closest possible matches in seconds.",
      },
    ],
  }),
  component: AIMatch,
});

const samples = [
  { e: "😺", g: "from-pink-200 to-orange-200", c: 98 },
  { e: "😸", g: "from-purple-200 to-pink-200", c: 94 },
  { e: "😻", g: "from-blue-200 to-purple-200", c: 89 },
  { e: "🐱", g: "from-green-200 to-blue-200", c: 83 },
  { e: "😽", g: "from-yellow-200 to-pink-200", c: 76 },
];

function AIMatch() {
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);

  const start = () => {
    setScanning(true);
    setDone(false);
    setTimeout(() => {
      setScanning(false);
      setDone(true);
    }, 2200);
  };

  return (
    <>
      <PageHero
        eyebrow="AI Match"
        title={
          <>
            Find your cat with <span className="text-gradient">a single photo.</span>
          </>
        }
        description="Drop a photo of your cat — CatNet compares it against thousands of found reports nearby in seconds."
      />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Upload card */}
          <div className="rounded-3xl bg-white/85 p-6 shadow-card">
            <h3 className="font-display text-xl font-bold">Upload a photo</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              JPG, PNG, or HEIC up to 10MB.
            </p>

            <label className="relative mt-6 grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-pink-50 to-purple-50 transition hover:border-primary">
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0" />
              {!scanning && !done && (
                <div className="text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white shadow-soft">
                    <ImagePlus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mt-3 text-sm font-bold">Drop a photo here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </div>
              )}
              {(scanning || done) && (
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 grid place-items-center text-[8rem]">
                    🐱
                  </div>
                  {scanning && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-glow animate-bounce-soft" />
                      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-center text-xs font-bold backdrop-blur">
                        <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
                        Scanning 14,238 cats nearby…
                      </div>
                    </>
                  )}
                  {done && (
                    <div className="absolute left-3 top-3 rounded-full bg-mint px-3 py-1 text-xs font-bold text-emerald-900">
                      Analysis complete
                    </div>
                  )}
                </div>
              )}
            </label>

            <button
              onClick={start}
              className="btn-bounce mt-6 flex w-full items-center justify-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
            >
              <Upload className="h-4 w-4" />
              {done ? "Run again" : "Start AI Match"}
            </button>
          </div>

          {/* Results */}
          <div className="relative rounded-3xl bg-white/85 p-6 shadow-card">
            <Magnifier className="pointer-events-none absolute -right-4 -top-8 h-20 w-20 animate-peek" />
            <h3 className="font-display text-xl font-bold">Top matches</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {done ? "5 candidates found near Brooklyn" : "Run a scan to see results"}
            </p>

            <ul className="mt-5 space-y-3">
              {samples.map((s, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-4 rounded-2xl p-3 transition ${
                    done ? "bg-secondary/30" : "bg-muted opacity-60"
                  }`}
                >
                  <div className={`grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${s.g} text-3xl`}>
                    {s.e}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">Possible match #{i + 1}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/70">
                      <div
                        className="h-full rounded-full gradient-primary transition-all duration-700"
                        style={{ width: done ? `${s.c}%` : "0%" }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    {done ? `${s.c}%` : "—"}
                  </span>
                </li>
              ))}
            </ul>

            {done && (
              <button className="btn-bounce mt-6 w-full rounded-full bg-mint px-6 py-3 text-sm font-bold text-emerald-900">
                Report a match
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
