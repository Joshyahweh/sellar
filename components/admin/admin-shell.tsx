"use client";

import {
  ArrowUpRight,
  BookOpen,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Mail,
  Package,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Books", icon: BookOpen },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/enquiries", label: "Messages", icon: Mail },
  { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
  { href: "/admin/legal", label: "Legal pages", icon: FileText },
] as const;

function initials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "A";
}

export function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative h-dvh overflow-hidden bg-[#e8edf5] text-[#14181b]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(41,108,240,0.16),transparent_46%),radial-gradient(ellipse_at_bottom_right,rgba(4,139,220,0.1),transparent_40%)]"
      />
      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[1440px] flex-col gap-4 px-4 py-4 desk:flex-row desk:items-stretch desk:gap-6 desk:px-6 desk:py-6">
        <aside className="shrink-0 desk:h-full desk:w-[252px]">
          <div className="flex flex-col rounded-[20px] border border-white/80 bg-white/90 p-3 shadow-[0_10px_40px_rgba(20,40,80,0.06)] backdrop-blur-md desk:h-full">
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#296cf0] font-bold text-[14px] text-white">
                {initials(name)}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#8b95a7] uppercase">Admin</p>
                <p className="truncate text-[15px] font-semibold text-[#14181b]">{name}</p>
              </div>
            </div>
            <nav className="mt-3 flex gap-1 overflow-x-auto desk:min-h-0 desk:flex-1 desk:flex-col desk:overflow-y-auto">
              {links.map((link) => {
                const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex shrink-0 items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[#5c6678] transition-colors hover:bg-[#f4f7fb] hover:text-[#14181b]",
                      active && "bg-[#e8f0fe] font-bold text-[#296cf0] hover:bg-[#e8f0fe] hover:text-[#296cf0]",
                    )}
                  >
                    <Icon size={16} strokeWidth={active ? 2.4 : 2} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/home"
              className="mt-3 flex items-center justify-between rounded-[12px] border border-[#e6ebf2] bg-[#f8fafc] px-3 py-2.5 text-[14px] font-semibold text-[#296cf0]"
            >
              View store
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
