"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "../data";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="MattYC.studio home">
        <Image
          className="brand-logo"
          src="/images/mattYC_logo_full_V1.png"
          alt="MattYC Studio"
          width={224}
          height={70}
          priority
        />
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const active = pathname === item.href || item.children?.some((child) => pathname === child.href);
          return (
            <div className="nav-item" key={item.href}>
              <Link className={active ? "nav-link active" : "nav-link"} href={item.href}>
                {item.label}
              </Link>
              {item.children ? (
                <div className="nav-submenu" aria-label={`${item.label} submenu`}>
                  {item.children.map((child) => (
                    <Link
                      className={pathname === child.href ? "nav-submenu-link active" : "nav-submenu-link"}
                      href={child.href}
                      key={child.href}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </header>
  );
}
