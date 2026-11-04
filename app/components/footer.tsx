import { href, Link } from "react-router";

const links = [
  { to: href("/services"), label: "Services" },
  { to: href("/work"), label: "Work" },
  { to: href("/about"), label: "About" },
  { to: href("/contact"), label: "Contact" },
];

export default function Footer() {
  return (
    <footer>
      <div className="page-width grid items-center gap-x-8 gap-y-2 py-6 text-sm text-muted-foreground sm:grid-cols-[1fr_auto_1fr]">
        <Link className="flex h-11 w-fit items-center gap-2 font-semibold text-foreground" to={href("/")}>
          <img src="/logo-mark.webp" alt="" width={24} height={24} className="size-5" />
          Moonflower Labs
        </Link>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-6">
            {links.map((link) => (
              <li key={link.to}>
                <Link className="flex h-11 items-center transition-colors hover:text-foreground" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="font-mono sm:text-right">&copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
