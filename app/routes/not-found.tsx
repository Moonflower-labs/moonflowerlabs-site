import { data, href, Link } from "react-router";
import { Button } from "@/components/ui/button";

export function loader() {
  return data(null, { status: 404 });
}

export function headers() {
  return { "Cache-Control": "no-store" };
}

export function meta() {
  return [{ title: "Page not found | Moonflower Labs" }, { name: "robots", content: "noindex" }];
}

export default function NotFound() {
  return (
    <section className="page-width py-20 md:py-32">
      <h1 className="text-display">
        Page not found
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
        This address doesn’t match anything on the site. Check the URL, or go back to the home page.
      </p>
      <Button asChild className="mt-8 h-12 px-6 text-base font-semibold">
        <Link to={href("/")}>Go to the home page</Link>
      </Button>
    </section>
  );
}
