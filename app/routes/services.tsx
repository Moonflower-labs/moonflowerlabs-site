import { href } from "react-router";
import ContactBand from "@/components/contact-band";
import { services } from "@/data/services";
import { buildMeta } from "@/lib/meta";

const labelStyle = "font-mono text-sm text-primary";

export function meta() {
  return buildMeta({
    path: href("/services"),
    title: "Services | Moonflower Labs",
    description: "Websites, online stores, apps, internal tools and integrations for small businesses, with support after launch.",
  });
}

export default function Services() {
  return (
    <>
      <header className="page-width pt-10 pb-20 md:pt-16 md:pb-28">
        <h1 className="max-w-4xl text-display text-balance">Is this what your business needs?</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-balance text-muted-foreground md:text-xl">
          What each service is for, and what you get from it.
        </p>
      </header>

      <section aria-label="Services" className="bg-card py-16 md:py-24">
        <ul className="page-width grid gap-4">
          {services.map((service) => (
            <li key={service.title} className="grid gap-8 rounded-xl bg-background p-6 md:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,4fr)] lg:gap-12">
              <h2 className="text-heading text-balance">{service.title}</h2>
              <div>
                <h3 className={labelStyle}>Good for</h3>
                <p className="mt-3 text-lg leading-relaxed">{service.goodFor}</p>
              </div>
              <div>
                <h3 className={labelStyle}>What you get</h3>
                <ul className="mt-3 grid gap-2 leading-relaxed text-muted-foreground">
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="support-heading" className="bg-foreground py-20 text-background md:py-28">
        <div className="page-width grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="support-heading" className="text-heading">
              After launch
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-background/75">
              Updates, fixes and new features once your site or app is live, for as long as you need them.
            </p>
          </div>
          <div>
            <h2 className="text-heading">Technical advice</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-background/75">
              Not sure which tools to use or whether to build at all? We’ll talk it through and give you a straight answer.
            </p>
          </div>
        </div>
      </section>

      <ContactBand />
    </>
  );
}
