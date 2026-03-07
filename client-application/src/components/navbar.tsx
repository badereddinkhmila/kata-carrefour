import { Link, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CartDropdown } from "@/components/cart-dropdown";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, type FC } from "react";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: FC<NavLinkProps> = ({ to, children, onClick }) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "relative rounded-lg px-4 py-2.5 text-sm font-medium no-underline transition-colors",
        isActive
          ? "text-foreground bg-primary/10"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
      {isActive && (
        <span
          className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary"
          aria-hidden
        />
      )}
    </Link>
  );
};

interface NavbarProps {
  className?: string;
}

const LOGO_LIGHT = "/logo.png";
const LOGO_DARK = "/logo-d.png";

export const Navbar: FC<NavbarProps> = ({ className }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl",
        "dark:border-border/40 dark:bg-background/70",
        className
      )}
    >
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className={cn(
            "flex items-center no-underline",
            "rounded-xl px-1 py-1.5 -ml-1 transition-colors",
            "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
          aria-label="Home"
        >
          <img
            src={LOGO_LIGHT}
            alt="Events"
            className="h-10 w-auto max-w-[180px] object-contain object-left dark:hidden"
          />
          <img
            src={LOGO_DARK}
            alt="Events"
            className="h-10 w-auto max-w-[180px] object-contain object-left hidden dark:block"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/">Home</NavLink>
          {isAuthenticated && <NavLink to="/dashboard">Dashboard</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          <CartDropdown />
          <ThemeSwitcher />
          <div className="hidden items-center gap-2 md:flex">
            <span className="mr-1 h-6 w-px bg-border" aria-hidden />
            {isAuthenticated ? (
              <Button variant="outline" size="sm" className="rounded-lg" asChild>
                <Link to="/dashboard">Account</Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link to="/login" search={{ redirect: "/dashboard" }}>Log in</Link>
                </Button>
                <Button size="sm" className="rounded-lg shadow-sm" asChild>
                  <Link to="/register" search={{ redirect: "/dashboard" }}>Sign up</Link>
                </Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2} />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className={cn(
            "md:hidden",
            "border-t border-border/50 bg-muted/20 backdrop-blur-sm",
            "rounded-b-2xl px-4 pb-6 pt-4 shadow-lg dark:bg-muted/30"
          )}
        >
          <nav className="flex flex-col gap-0.5">
            <NavLink to="/" onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
            )}
            <div className="my-3 flex justify-center">
              <CartDropdown />
            </div>
            <div className="my-3 h-px bg-border/80" />
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-2 py-1">
              Account
            </div>
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center rounded-lg"
                asChild
              >
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  Account
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center rounded-lg"
                  asChild
                >
                  <Link to="/login" search={{ redirect: "/dashboard" }} onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="w-full justify-center rounded-lg shadow-sm"
                  asChild
                >
                  <Link to="/register" search={{ redirect: "/dashboard" }} onClick={() => setMobileOpen(false)}>
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
