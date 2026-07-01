import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CatLogo } from "@/components/sections/CatIllustrations";
import { AmbientStickers } from "@/components/sections/Stickers";

function NotFoundComponent() {
  return (
    <div className="grid min-h-screen place-items-center px-6 gradient-dream">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid h-32 w-32 place-items-center rounded-full bg-white/70 shadow-soft">
          <CatLogo size={96} />
        </div>
        <h1 className="font-display text-6xl font-bold text-gradient">404</h1>
        <h2 className="mt-3 font-display text-2xl font-bold">
          Have you seen this page?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This little cat got lost. Let's get you back home.
        </p>
        <Link
          to="/"
          className="btn-bounce mt-6 inline-flex rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center px-6 gradient-dream">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-white/70 shadow-soft">
          <CatLogo size={64} sleeping />
        </div>
        <h1 className="font-display text-2xl font-bold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something tangled the yarn. You can try again or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-bounce rounded-full gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft"
          >
            Try again
          </button>
          <a
            href="/"
            className="btn-bounce rounded-full bg-white px-5 py-2.5 text-sm font-bold text-foreground shadow-soft"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CatNet — Helping Every Cat Find Their Way Home" },
      {
        name: "description",
        content:
          "AI-powered lost & found and adoption platform for cats. Reunite, rescue, and adopt with a kind community.",
      },
      { property: "og:title", content: "CatNet — Helping Every Cat Find Their Way Home" },
      {
        property: "og:description",
        content: "AI-powered lost & found and adoption platform for cats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="relative min-h-screen overflow-x-clip">
          <AmbientStickers />
          <div className="relative z-10">
            <Navbar />
            <main>
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}