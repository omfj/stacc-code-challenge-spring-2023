import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Links to be displayed in the navigation.
 *
 * If the `session` property is set to `true`, the link will only be displayed
 * if the user is logged in. If the `session` property is set to `false`, the
 * link will only be displayed if the user is logged out.
 */
const LINKS = [
  {
    href: "/",
    label: "🏠 Hjem",
  },
  {
    href: "/provider",
    label: "🔧 Leverandør",
  },
  {
    href: "/prices",
    label: "💰 Priser",
  },
  {
    href: "/account",
    label: "👤 Konto",
    session: true,
  },
  {
    href: "/api/auth/signout",
    label: "🚪 Logg ut",
    session: true,
  },
  {
    href: "/signin",
    label: "🔑 Logg inn",
    session: false,
  },
];

const Header = () => {
  const { pathname } = useRouter();
  const { data: userSession } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className={`${menuOpen ? "min-h-screen" : ""}`}>
      <header className="mx-auto mb-14 flex w-full max-w-5xl items-center border-b px-5 py-5 md:py-5">
        <h1 className="flex-1">
          <Link className="text-3xl font-bold" href="/">
            ⚡ Strømsta
          </Link>
        </h1>

        <nav className="hidden md:block">
          <ul className="flex">
            {LINKS.map(({ href, label, session }) => {
              const isActive = pathname === href;

              if (session === !userSession) {
                return null;
              }

              return (
                <li key={`${href}${label}`}>
                  <Link
                    className={`rounded-xl px-3 py-2 transition-colors hover:bg-neutral-200 ${
                      isActive ? "font-bold" : ""
                    }`}
                    href={href}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          className="block h-9 w-9 rounded-lg p-1 hover:bg-neutral-200 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-full w-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-full w-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </header>
      {menuOpen && (
        <nav className="px-3 md:hidden">
          <ul className="flex flex-col gap-5">
            {LINKS.map(({ href, label, session }) => {
              const isActive = pathname === href;

              if (session === !userSession) {
                return null;
              }

              return (
                <li key={`${href}${label}`}>
                  <Link
                    className={`duration-175 rounded-xl px-3 py-1 text-3xl transition-all hover:ml-3 hover:bg-neutral-200 ${
                      isActive ? "font-bold" : ""
                    }`}
                    href={href}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Header;
