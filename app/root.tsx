import { href, isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import type { Route } from "./+types/root";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./app.css";

export function meta({ error }: Route.MetaArgs) {
  if (!error) return [];
  return [{ title: "Something went wrong | Moonflower Labs" }, { name: "robots", content: "noindex" }];
}

export function Layout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <link rel="icon" href="/favicon.ico" sizes="48x48 32x32 16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Links />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-background focus:p-3 focus:text-foreground"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <section className="page-width py-20 md:py-32">
      <h1 className="text-display text-balance">{isNotFound ? "Page not found" : "Something went wrong"}</h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
        {isNotFound
          ? "This address doesn’t match anything on the site."
          : "This page didn’t load properly. Try again, or go back to the home page."}
      </p>
      <Button asChild className="mt-8 h-12 px-6 text-base font-semibold">
        <Link to={href("/")}>Go to the home page</Link>
      </Button>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="mt-10 overflow-x-auto text-sm text-muted-foreground">{error.stack}</pre>
      )}
    </section>
  );
}
