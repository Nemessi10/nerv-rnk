"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  BarChart3,
  Disc3,
  Home,
  Library,
  ListMusic,
  Menu,
  ThumbsUp,
  X,
  LogOut,
  User,
  Moon,
  Sun,
  Palette,
  Music,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { useAuth } from "~/hooks/use-auth";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "~/components/ui/dropdown-menu";

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const { isLoggedIn, login, logout, user } = useAuth();

  const userName = user?.display_name ?? "Music Fan";

  const userAvatar =
    user?.images && user?.images.length > 0 ? user.images[0]?.url : null;

  const availableThemes = [
    { id: "light", name: "Light Mode", icon: Sun, color: "text-amber-500" },
    { id: "dark", name: "Dark Mode", icon: Moon, color: "text-indigo-500" },
    {
      id: "nerv-dark",
      name: "nerv-dark",
      icon: Palette,
      color: "text-primary",
    },
    {
      id: "nerv-wave",
      name: "nerv-wave",
      icon: Palette,
      color: "text-sky-500",
    },
  ];

  const routes = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Library", href: "/library", icon: Library },
    { name: "Rate Albums", href: "/rate", icon: ThumbsUp },
    { name: "Rankings", href: "/rankings", icon: ListMusic },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
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
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 select-none overflow-hidden rounded-full border border-secondary/10 bg-card p-0 transition-transform hover:bg-card focus-visible:ring-0 focus-visible:ring-offset-0 active:scale-95"
                >
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt={userName}
                      fill
                      sizes="36px"
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="mt-2 w-56 rounded-md border border-secondary/10 bg-card shadow-lg"
              >
                <DropdownMenuLabel className="p-3 font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="truncate text-sm font-bold leading-none text-foreground">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Spotify Connected
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-background" />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="mx-1 flex cursor-pointer items-center gap-2 rounded-sm py-2 text-sm font-medium transition-colors focus:bg-accent/10 data-[state=open]:bg-accent/10">
                    {theme === "dark" || theme === "nerv-dark" ? (
                      <Moon className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-500" />
                    )}
                    <span>Switch Theme</span>
                  </DropdownMenuSubTrigger>

                  <DropdownMenuSubContent className="mx-1 w-48 rounded-md border border-secondary/10 bg-card p-1 shadow-md">
                    {availableThemes.map((t) => (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium focus:bg-accent/10",
                          theme === t.id &&
                            "bg-secondary/40 font-bold text-primary",
                        )}
                      >
                        <t.icon className={cn("h-3.5 w-3.5", t.color)} />
                        <span>{t.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="bg-background" />

                <DropdownMenuItem
                  onClick={() => logout()}
                  className="m-1 flex cursor-pointer items-center gap-2 rounded-sm py-2 text-sm font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={login}
              className="hidden cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground md:flex"
            >
              <Music className="h-4 w-4" />
              <span>Connect Spotify</span>
            </button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-64 flex-col justify-between border-0 bg-background p-0 shadow-lg"
            >
              <div>
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
              </div>

              <div className="space-y-2 border-t border-secondary/10 p-4">
                <Button
                  variant="outline"
                  className="h-10 w-full justify-start gap-3 border-secondary/20 text-sm font-medium"
                  onClick={() => {
                    const currentIndex = availableThemes.findIndex(
                      (t) => t.id === theme,
                    );
                    const nextIndex =
                      (currentIndex + 1) % availableThemes.length;
                    setTheme(availableThemes[nextIndex]?.id ?? "dark");
                  }}
                >
                  <Palette className="h-5 w-5 text-primary" />
                  <span>Cycle Themes ({theme})</span>
                </Button>

                {isLoggedIn ? (
                  <Button
                    variant="destructive"
                    className="h-10 w-full gap-3 text-sm font-medium"
                    onClick={() => {
                      void logout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start gap-3 border-secondary/30 px-3 text-sm font-medium text-muted-foreground"
                    onClick={() => {
                      void login();
                      setOpen(false);
                    }}
                  >
                    <Music className="h-5 w-5" />
                    <span>Connect Spotify</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
