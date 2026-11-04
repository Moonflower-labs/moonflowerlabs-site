import { href, Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function ContactBand() {
  return (
    <section aria-labelledby="contact-heading" className="bg-primary py-20 text-primary-foreground md:py-28">
      <div className="page-width flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-4xl">
          <h2 id="contact-heading" className="text-display text-balance">
            Not sure what you need yet?
          </h2>
          <p className="mt-5 text-lg text-primary-foreground/80">
            That’s fine. Tell us the problem and we’ll tell you honestly if we can help.
          </p>
        </div>
        <Button asChild variant="secondary" className="h-12 px-6 text-base font-semibold focus-visible:outline-primary-foreground">
          <Link to={href("/contact")}>Ask us a question</Link>
        </Button>
      </div>
    </section>
  );
}
