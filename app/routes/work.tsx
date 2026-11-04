import { href } from "react-router";
import ContactBand from "@/components/contact-band";
import { projects } from "@/data/work";
import { buildMeta } from "@/lib/meta";
import type { Route } from "./+types/work";

const SCREENSHOT_WIDTH = 1280;
const SCREENSHOT_HEIGHT = 800;
const SCREENSHOT_SIZES = "(min-width: 1280px) 728px, (min-width: 1024px) 58vw, 100vw";

export const links: Route.LinksFunction = () => [
  { rel: "preload", as: "image", imageSrcSet: projects[0].imageSet, imageSizes: SCREENSHOT_SIZES },
];

export function meta() {
  return buildMeta({
    path: href("/work"),
    title: "Work | Moonflower Labs",
    description: "Four live websites built and looked after by Moonflower Labs for one client, on one shared platform.",
  });
}

export default function Work() {
  return (
    <>
      <header className="page-width pt-10 pb-20 md:pt-16 md:pb-28">
        <h1 className="text-display">Our work</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-balance text-muted-foreground md:text-xl">
          Four live sites for one client, each with its own brand. We built them and still look after them.
        </p>
      </header>

      <section aria-label="Projects" className="bg-card py-20 md:py-28">
        <ul className="page-width grid gap-20 md:gap-28">
          {projects.map((project, index) => (
            <li key={project.name} className={`grid items-center gap-8 lg:gap-16 ${index % 2 ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"}`}>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                tabIndex={-1}
                aria-hidden="true"
                className={`block overflow-hidden rounded-xl border transition-opacity hover:opacity-90 ${index % 2 ? "lg:order-2" : ""}`}
              >
                <img
                  srcSet={project.imageSet}
                  sizes={SCREENSHOT_SIZES}
                  alt=""
                  width={SCREENSHOT_WIDTH}
                  height={SCREENSHOT_HEIGHT}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  style={{ backgroundColor: project.placeholder }}
                  className="block h-auto w-full"
                />
              </a>
              <div>
                <p className="font-mono text-sm font-medium text-primary">{project.type}</p>
                <h2 className="mt-3 text-heading">{project.name}</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">{project.description}</p>
                <ul className="mt-6 grid gap-2 font-medium">
                  {project.built.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Visit ${project.name}`}
                  className="mt-6 inline-flex h-11 items-center font-mono text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {new URL(project.url).hostname}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="platform-heading" className="bg-foreground py-20 text-background md:py-28">
        <div className="page-width">
          <h2 id="platform-heading" className="max-w-3xl text-heading text-balance">
            Four brands, one platform
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-background/75">
            All four sites run on one shared system, with a single admin area for content and common code for payments, email and media. New features can reach every brand without building them four times.
          </p>
        </div>
      </section>

      <ContactBand />
    </>
  );
}
