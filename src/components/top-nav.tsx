"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Disc3,
  Home,
  Library,
  ListMusic,
  Menu,
  Settings,
  ThumbsUp,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { ThemeToggle } from "~/components/theme-toggle";

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const routes = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      name: "Library",
      href: "/library",
      icon: Library,
    },
    {
      name: "Rate Albums",
      href: "/rate",
      icon: ThumbsUp,
    },
    {
      name: "Rankings",
      href: "/rankings",
      icon: ListMusic,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-16 border-0 bg-background shadow-md">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Disc3 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">nerv-rnk</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-1 md:flex">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === route.href
                  ? "bg-card text-primary"
                  : "text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              <span>{route.name}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile Menu Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-64 border-0 bg-background p-0 shadow-lg"
            >
              <div className="flex h-16 items-center border-b-0 px-4">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <Disc3 className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">nerv-rnk</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="grid gap-1 p-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-card hover:text-accent",
                      pathname === route.href
                        ? "bg-card text-primary"
                        : "text-muted-foreground",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <route.icon className="h-5 w-5" />
                    <span>{route.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-4 left-4">
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
