import { useCallback, useRef } from "react";
import { href, Link } from "react-router";
import BinaryMorph from "@/components/binary-morph";
import { services } from "@/data/services";

// Share of the distance between two shapes that each one stays whole for, as the page scrolls.
const HOLD = 0.12;

export default function ServicesShowcase() {
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getSlots = useCallback(() => slotRefs.current.filter((slot) => slot !== null), []);

  const getCenters = useCallback(
    () =>
      getSlots().map((slot) => {
        const rect = slot.getBoundingClientRect();
        return rect.top + rect.height / 2;
      }),
    [getSlots],
  );

  // 0 is the first shape and 2 the last. Fractions are digits travelling between two shapes.
  const getPosition = useCallback(() => {
    const centers = getCenters();
    const viewportCenter = window.innerHeight / 2;
    let position = 0;
    for (let index = 0; index < centers.length - 1; index++) {
      const travelled = (viewportCenter - centers[index]) / (centers[index + 1] - centers[index]);
      position += Math.min(1, Math.max(0, (travelled - HOLD) / (1 - HOLD * 2)));
    }
    return position;
  }, [getCenters]);

  return (
    <section aria-labelledby="services-heading" className="relative bg-foreground py-20 text-background md:py-28">
      <BinaryMorph getSlots={getSlots} getPosition={getPosition} />
      <div className="page-width relative">
        <h2 id="services-heading" className="text-display text-balance">
          What we can build for you
        </h2>
        <ul className="mt-14 grid gap-24 lg:gap-0">
          {services.map((service, index) => (
            <li
              key={service.title}
              className="grid items-center gap-10 lg:min-h-[85svh] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
            >
              <div
                ref={(slot) => {
                  slotRefs.current[index] = slot;
                }}
                className="aspect-[2/1.6] w-full lg:order-2"
              />
              <div>
                <h3 className="text-subheading text-balance">{service.title}</h3>
                <p className="mt-3 max-w-md text-lg leading-relaxed text-background/75">{service.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link
          className="mt-20 inline-flex h-11 lg:mt-4 items-center font-medium underline decoration-background/40 underline-offset-4 transition-colors hover:decoration-background focus-visible:outline-background"
          to={href("/services")}
        >
          See all services
        </Link>
      </div>
    </section>
  );
}
