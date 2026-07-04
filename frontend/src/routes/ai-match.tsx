import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Sparkles, Upload, ImagePlus, AlertCircle } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Magnifier } from "@/components/sections/CatIllustrations";
import { CatCard } from "@/components/cards/CatCard";
import { matchByPhoto } from "@/lib/posts";
import { ApiClientError } from "@/lib/api";
import type { AiMatchResult } from "@/types";

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

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB, matches backend + AI service

function AIMatch() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<AiMatchResult[] | null>(null);
  const [candidatesScanned, setCandidatesScanned] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setResults(null);
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    reset();

    if (file.size > MAX_FILE_BYTES) {
      setError("That photo is too large — please use one under 10MB.");
      return;
    }

    // Free the previous preview URL before creating a new one.
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });

    setScanning(true);
    try {
      const data = await matchByPhoto(file);
      setResults(data.matches);
      setCandidatesScanned(data.candidatesScanned);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Something went wrong while matching your photo. Please try again."
      );
    } finally {
      setScanning(false);
    }
  };

  const handleBrowseClick = () => fileInputRef.current?.click();

  return (
    <>
      <PageHero
        eyebrow="AI Match"
        title={
          <>
            Find your cat with <span className="text-gradient">a single photo.</span>
          </>
        }
        description="Drop a photo of your cat — CatNet compares it against every Lost/Found report using real image-similarity AI, not a guess."
      />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Upload card */}
          <div className="rounded-3xl bg-white/85 p-6 shadow-card">
            <h3 className="font-display text-xl font-bold">Upload a photo</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              JPG, PNG, or WEBP up to 10MB.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={handleBrowseClick}
              className="relative mt-6 grid aspect-square w-full cursor-pointer place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-pink-50 to-purple-50 transition hover:border-primary"
            >
              {!previewUrl && (
                <div className="text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white shadow-soft">
                    <ImagePlus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mt-3 text-sm font-bold">Drop a photo here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </div>
              )}

              {previewUrl && (
                <div className="relative h-full w-full">
                  <img
                    src={previewUrl}
                    alt="Uploaded cat"
                    className="h-full w-full object-cover"
                  />
                  {scanning && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-glow animate-bounce-soft" />
                      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-center text-xs font-bold backdrop-blur">
                        <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
                        Comparing against Lost &amp; Found posts…
                      </div>
                    </>
                  )}
                  {results && !scanning && (
                    <div className="absolute left-3 top-3 rounded-full bg-mint px-3 py-1 text-xs font-bold text-emerald-900">
                      Analysis complete
                    </div>
                  )}
                </div>
              )}
            </button>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-coral/10 p-3 text-sm text-coral">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleBrowseClick}
              disabled={scanning}
              className="btn-bounce mt-6 flex w-full items-center justify-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {scanning ? "Scanning…" : results ? "Try another photo" : "Start AI Match"}
            </button>
          </div>

          {/* Results */}
          <div className="relative rounded-3xl bg-white/85 p-6 shadow-card">
            <Magnifier className="pointer-events-none absolute -right-4 -top-8 h-20 w-20 animate-peek" />
            <h3 className="font-display text-xl font-bold">Top matches</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {results
                ? results.length > 0
                  ? `${results.length} candidate${results.length === 1 ? "" : "s"} found from ${candidatesScanned} posts scanned`
                  : `No close matches found in ${candidatesScanned} posts — check back as more get posted`
                : "Upload a photo to see results"}
            </p>

            {!results && (
              <div className="mt-8 grid place-items-center rounded-2xl bg-muted/50 py-16 text-center text-sm text-muted-foreground">
                Your matches will show up here.
              </div>
            )}

            {results && results.length > 0 && (
              <div className="mt-5 grid gap-4">
                {results.map((match) => (
                  <div key={match._id} className="relative">
                    <div className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-primary shadow-soft">
                      {match.matchScore}% match
                    </div>
                    <CatCard cat={match} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}