"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListOrdered, Wallet, BarChart3, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/", label: "Today", icon: Home },
  { href: "/earnings", label: "Earnings", icon: ListOrdered },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-ink/95 backdrop-blur safe-bottom">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-medium",
                active ? "text-lime" : "text-neutral-500"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
