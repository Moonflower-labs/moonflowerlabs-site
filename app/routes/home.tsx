import { href, Link } from "react-router";
import BinaryBloom from "@/components/binary-bloom";
import ContactBand from "@/components/contact-band";
import ServicesShowcase from "@/components/services-showcase";
import { Button } from "@/components/ui/button";
import { buildMeta } from "@/lib/meta";

const steps = [
  {
    title: "Tell us what you need",
    description: "We ask questions until the problem and the scope are clear.",
  },
  {
    title: "Agree the plan",
    description: "You see what we’ll build, what it costs and how long it takes before work starts.",
  },
  {
    title: "We build it",
    description: "We work in stages and show you progress, so you can change course early.",
  },
  {
    title: "We look after it",
    description: "Updates, fixes and new features for as long as you need them. We still look after the platforms we’ve built.",
  },
];

const sectionHeading = "text-heading text-balance";
const primaryAction = "h-12 px-6 text-base font-semibold";

export function meta() {
  return buildMeta({
    path: href("/"),
    title: "Moonflower Labs | Software built for your business",
    description: "Moonflower Labs builds websites, apps and integrations for small businesses, and looks after them long after launch.",
  });
}

export default function Home() {
  return (
    <>
      <section
        aria-labelledby="home-heading"
        className="relative flex min-h-lvh flex-col gap-10 overflow-hidden pt-10 pb-8 md:pt-16 lg:min-h-[max(44rem,100lvh)] lg:flex-row lg:items-center lg:py-16"
      >
        <div className="page-width pointer-events-none relative z-10 [&>*]:pointer-events-auto [&>*]:w-fit">
          <h1 id="home-heading" className="text-display">
            <span className="block">Software built</span>
            <span className="block">for your business.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-balance text-muted-foreground md:text-xl">
            Websites, apps and integrations, looked after long after launch.
          </p>
          <Button asChild className={`mt-8 ${primaryAction}`}>
            <Link to={href("/contact")}>Get in touch</Link>
          </Button>
        </div>
        <div className="mx-auto my-auto aspect-square select-none w-full max-w-xl px-4 lg:absolute lg:top-1/2 lg:right-[max(1.25rem,calc(50vw-39rem))] lg:my-0 lg:w-[min(46vw,40rem)] lg:max-w-none lg:-translate-y-1/2 lg:px-0">
          <BinaryBloom />
        </div>
      </section>

      <ServicesShowcase />

      <section aria-labelledby="process-heading" className="bg-card py-20 md:py-28">
        <div className="page-width">
          <h2 id="process-heading" className={sectionHeading}>
            How it works
          </h2>
          <ol className="mt-12 grid gap-10 md:mt-16 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title}>
                <p aria-hidden="true" className="font-mono text-5xl leading-none font-medium tracking-tighter text-primary md:text-6xl">
                  {(index + 1).toString(2).padStart(3, "0")}
                </p>
                <h3 className="mt-6 text-title">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ContactBand />
    </>
  );
}
