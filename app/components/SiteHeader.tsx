"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "../data";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="MattYC.studio home">
        <span className="brand-mark">MYC</span>
        <span className="brand-text">MattYC.studio</span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} className={active ? "nav-link active" : "nav-link"} href={item.href}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
