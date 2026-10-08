"use client";

import type { User } from "@supabase/supabase-js";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BoxIcon,
  BuyIcon,
  CrossIcon,
  LockIcon,
  LogoutIcon,
  MenuIcon,
  ProfileCircleIcon,
  UserIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type HeaderNavProps = {
  variant?: "unsigned" | "auth" | "signedIn" | "checkout" | "orders";
  className?: string;
};

const unsignedItems = [
  { href: "/#reviews", label: "Reviews" },
  { href: "/#about-author", label: "About Author" },
  { href: "/#about-book", label: "About Book" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/contact", label: "Contact us" },
] as const;

const authItems = [
  { href: "/", label: "Home page" },
  { href: "/#about-author", label: "About Author" },
  { href: "/#about-book", label: "About Book" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/contact", label: "Contact us" },
] as const;

const signedInItems = [
  { href: "/home#about-author", label: "About Author" },
  { href: "/home#about-book", label: "About Book" },
  { href: "/home#faqs", label: "FAQs" },
  { href: "/home#reviews", label: "Reviews" },
  { href: "/contact", label: "Contact us" },
] as const;

function initials(user: User) {
  const name = String(user.user_metadata?.full_name ?? "").trim();
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (user.email?.[0] ?? "U").toUpperCase();
}

function AccountMenu({
  user,
  isAdmin,
  onSignOut,
}: {
  user: User | null;
  isAdmin: boolean;
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuBox, setMenuBox] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuBox({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }

    function onPointer(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (buttonRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-account-menu]")) return;
      setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    place();
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const itemClass =
    "flex w-full items-center gap-[10px] border-0 bg-transparent px-[16px] py-[10px] text-left font-medium text-[15px] leading-[normal] text-[#242428]";

  const menu =
    open && menuBox
      ? createPortal(
          <div
            data-account-menu
            role="menu"
            style={{ top: menuBox.top, right: menuBox.right }}
            className="fixed z-[80] min-w-[176px] rounded-[16px] bg-white py-[8px] shadow-[0_12px_40px_rgba(20,24,27,0.12)]"
          >
            {user ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                    <LayoutDashboard size={18} color="#373535" />
                    Dashboard
                  </Link>
                ) : null}
                <Link href="/profile" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                  <UserIcon size={18} color="#373535" />
                  Profile
                </Link>
                <Link href="/orders" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                  <BoxIcon size={18} color="#373535" />
                  Track order
                </Link>
                <Link
                  href="/change-password"
                  role="menuitem"
                  className={itemClass}
                  onClick={() => setOpen(false)}
                >
                  <LockIcon size={18} color="#373535" />
                  Change password
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className={cn(itemClass, "cursor-pointer text-[#FF0C6D]")}
                  onClick={() => {
                    setOpen(false);
                    onSignOut();
                  }}
                >
                  <LogoutIcon size={18} color="#FF0C6D" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  role="menuitem"
                  className="block px-[28px] py-[10px] text-center font-medium text-[16px] leading-[normal] text-[#242428]"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/create-account"
                  role="menuitem"
                  className="block px-[28px] py-[10px] text-center font-medium text-[16px] leading-[normal] text-[#242428]"
                  onClick={() => setOpen(false)}
                >
                  Create account
                </Link>
              </>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          "relative flex size-[40px] cursor-pointer items-center justify-center overflow-clip rounded-[30px] border-0 p-0",
          user ? "bg-[#FF0C6D]" : "bg-[#ededed]",
        )}
        onClick={() => setOpen((value) => !value)}
      >
        {user ? (
          <span className="font-bold text-[14px] leading-[normal] text-white">{initials(user)}</span>
        ) : (
          <ProfileCircleIcon size={24} color="#626262" />
        )}
      </button>
      {menu}
    </div>
  );
}

export function HeaderNav({ variant = "unsigned", className }: HeaderNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    function syncHash() {
      setHash(window.location.hash);
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  function itemIsActive(href: string) {
    const [path, id] = href.split("#");
    const target = path || "/";
    if (id) return pathname === target && hash === `#${id}`;
    if (href === "/") return pathname === "/" && hash === "";
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  const items =
    variant === "auth"
      ? authItems
      : variant === "signedIn" || variant === "checkout"
        ? signedInItems
        : unsignedItems;
  const showCart = variant === "checkout";

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const client = supabase;

    let active = true;

    async function loadRole(userId: string | null) {
      if (!userId) {
        if (active) setIsAdmin(false);
        return;
      }
      const { data: profile } = await client.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (active) setIsAdmin(profile?.role === "admin");
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      void loadRole(data.user?.id ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      void loadRole(nextUser?.id ?? null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex w-full items-center justify-between border-b border-solid border-[#f2f3f8] bg-white px-4 py-3 desk:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-[40px] items-center justify-center border-0 bg-transparent p-0"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <CrossIcon size={18} color="#14181b" />
          ) : (
            <MenuIcon size={24} color="#14181b" />
          )}
        </button>
        <div className="flex items-center gap-2">
          {showCart ? (
            <Link
              href="/checkout"
              aria-label="Cart"
              className="relative flex size-[40px] shrink-0 items-center justify-center"
            >
              <BuyIcon size={24} color="#373535" />
            </Link>
          ) : null}
          <AccountMenu user={user} isAdmin={isAdmin} onSignOut={signOut} />
        </div>
      </header>
      <div className="h-[65px] shrink-0 desk:hidden" aria-hidden />
      {open ? (
        <div className="fixed inset-x-0 top-[65px] bottom-0 z-40 overflow-y-auto bg-white desk:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {items.map((item) => {
              const active = itemIsActive(item.href);
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-[8px] px-3 py-3 text-[16px]",
                    active ? "font-bold text-[#296cf0]" : "font-medium text-[#373535]",
                  )}
                  onClick={() => {
                    setOpen(false);
                    setHash(item.href.includes("#") ? `#${item.href.split("#")[1]}` : "");
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}

      <nav
        className={cn(
          "absolute top-[23px] left-1/2 z-10 hidden -translate-x-1/2 flex-col items-start overflow-clip rounded-[11px] border border-solid border-[#f2f3f8] bg-white px-[20px] py-[8px] desk:flex",
          className,
        )}
      >
        <div className="flex items-center gap-[12px]">
          {items.map((item) => {
            const active = itemIsActive(item.href);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center p-[10px] text-[14px] leading-[normal] whitespace-nowrap",
                  active ? "font-bold text-[#296cf0]" : "font-medium text-[#373535]",
                )}
                onClick={() => setHash(item.href.includes("#") ? `#${item.href.split("#")[1]}` : "")}
              >
                {item.label}
              </Link>
            );
          })}
          {showCart ? (
            <Link
              href="/checkout"
              aria-label="Cart"
              className="relative flex size-[40px] shrink-0 items-center justify-center"
            >
              <BuyIcon size={24} color="#373535" />
            </Link>
          ) : null}
          <AccountMenu user={user} isAdmin={isAdmin} onSignOut={signOut} />
        </div>
      </nav>
    </>
  );
}
