import { href } from "react-router";
import ContactBand from "@/components/contact-band";
import { buildMeta } from "@/lib/meta";

const principles = [
  {
    title: "Plain English",
    description: "You get clear answers about what we’re building, what it costs and how long it takes, without the jargon.",
  },
  {
    title: "Built to last",
    description: "We use proven tools and keep things simple, so your software stays easy to change later.",
  },
  {
    title: "Here after launch",
    description: "We don’t hand over and disappear. We still look after the platforms we’ve built.",
  },
];

const tools = ["TypeScript", "JavaScript", "React", "Node.js", "Python", "PostgreSQL", "Tailwind CSS", "Stripe"];

export function meta() {
  return buildMeta({
    path: href("/about"),
    title: "About | Moonflower Labs",
    description: "Moonflower Labs is a software studio that builds and looks after websites, apps and integrations for small businesses.",
  });
}

export default function About() {
  return (
    <>
      <header className="page-width pt-10 pb-20 md:pt-16 md:pb-28">
        <h1 className="max-w-4xl text-display text-balance">A software studio for small businesses.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-balance text-muted-foreground md:text-xl">
          We build websites, apps and integrations, then stay around to look after them.
        </p>
      </header>

      <section aria-labelledby="principles-heading" className="bg-foreground py-20 text-background md:py-28">
        <div className="page-width">
          <h2 id="principles-heading" className="text-heading">
            How we like to work
          </h2>
          <ul className="mt-12 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-12">
            {principles.map((principle) => (
              <li key={principle.title}>
                <h3 className="text-title">{principle.title}</h3>
                <p className="mt-3 leading-relaxed text-background/75">{principle.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="tools-heading" className="bg-card py-20 md:py-28">
        <div className="page-width">
          <h2 id="tools-heading" className="text-heading">
            Tools we use
          </h2>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-lg text-primary md:text-xl">
            {tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </section>

      <ContactBand />
    </>
  );
}
