import Link from "next/link";
import { navItems } from "../data";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-kicker">MattYC.studio</p>
        <p className="footer-copy">
          A place to collect the work, the practice, the mistakes, and the next ideas.
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
