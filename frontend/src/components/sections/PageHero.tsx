import type { ReactNode } from "react";
import { Blob, Butterfly, PawPrint, YarnBall } from "./CatIllustrations";

/* Reusable layout for inner pages */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16">
      <Blob
        color="#F9C5D5"
        className="pointer-events-none absolute -top-20 -left-20 h-[420px] w-[420px] opacity-50 animate-blob"
      />
      <Blob
        color="#D8C7FF"
        className="pointer-events-none absolute -top-10 right-0 h-[360px] w-[360px] opacity-40 animate-blob"
      />
      <Butterfly className="pointer-events-none absolute right-[12%] top-12 h-14 w-14" />
      <YarnBall className="pointer-events-none absolute bottom-4 left-[8%] h-12 w-12 animate-spin-slow" />
      <PawPrint
        className="pointer-events-none absolute bottom-6 right-[20%] animate-paw"
        color="#FFD6BA"
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-soft">
            🐾 {eyebrow}
          </span>
        )}
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
