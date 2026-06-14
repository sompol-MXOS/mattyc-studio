import Link from "next/link";
import { navItems } from "../data";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-kicker">Classical foundation. Creator future.</p>
        <p className="footer-copy">
          Matt.YC is a young creator shaped by disciplined piano study and expanding into composition,
          performance, production, and new creative technologies.
        </p>
      </div>
      <div className="footer-links">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
