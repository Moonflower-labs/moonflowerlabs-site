import { href, Link } from "react-router";
import { Button } from "@/components/ui/button";

export function meta() {
  return [{ title: "Message sent | Moonflower Labs" }, { name: "robots", content: "noindex" }];
}

export default function Thanks() {
  return (
    <section className="page-width py-20 md:py-32">
      <h1 className="text-display text-balance">Thanks for getting in touch.</h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
        We received your message and will get back to you as soon as we can.
      </p>
      <Button asChild className="mt-8 h-12 px-6 text-base font-semibold">
        <Link to={href("/")}>Go to the home page</Link>
      </Button>
    </section>
  );
}
