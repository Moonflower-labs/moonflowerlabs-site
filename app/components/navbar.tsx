import { useRef } from "react";
import { href, Link, NavLink } from "react-router";

const links = [
  { to: href("/services"), label: "Services" },
  { to: href("/work"), label: "Work" },
  { to: href("/about"), label: "About" },
  { to: href("/contact"), label: "Let’s talk" },
];

const headerStyle = "page-width flex items-center justify-between gap-4 py-4 md:py-6";
const menuButtonStyle = "flex h-11 items-center px-1 font-medium";

function linkColor({ isActive }: { isActive: boolean }) {
  return isActive ? "text-foreground" : "text-muted-foreground";
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link className="flex h-11 shrink-0 items-center gap-2 font-semibold tracking-tight whitespace-nowrap md:text-lg" to={href("/")} onClick={onClick}>
      <img src="/logo-mark.webp" alt="" width={24} height={24} className="size-5 md:size-6" />
      Moonflower Labs
    </Link>
  );
}

function PhoneMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();
  // Opening focuses the first link by default, which draws its focus ring. Focus the panel instead.
  const open = () => {
    dialogRef.current?.showModal();
    dialogRef.current?.focus();
  };

  return (
    <>
      <button type="button" className={`${menuButtonStyle} sm:hidden`} onClick={open}>
        Menu
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        tabIndex={-1}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-background text-foreground outline-none"
      >
        <div className={headerStyle}>
          <Logo onClick={close} />
          <button type="button" className={menuButtonStyle} onClick={close}>
            Close
          </button>
        </div>
        <nav aria-label="Menu" className="page-width pt-8 pb-12">
          <ul className="grid gap-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  prefetch="intent"
                  onClick={close}
                  className={({ isActive }) => `block py-2 text-display transition-colors hover:text-foreground ${linkColor({ isActive })}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}

export default function Navbar() {
  return (
    <header className={headerStyle}>
      <Logo />
      <nav aria-label="Main" className="hidden sm:block">
        <ul className="flex items-center gap-5 font-medium whitespace-nowrap md:gap-8">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                prefetch="intent"
                className={({ isActive }) => `flex h-11 items-center transition-colors hover:text-foreground ${linkColor({ isActive })}`}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <PhoneMenu />
    </header>
  );
}
