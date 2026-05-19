// src/components/top-nav.tsx
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
  Music, // 💡 Додано іконку ноти для відповідності стилю роутів
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
  
  const userAvatar = user?.images && user?.images.length > 0 
    ? user.images[0].url 
    : null;

  const availableThemes = [
    { id: "light", name: "Light Mode", icon: Sun, color: "text-amber-500" },
    { id: "dark", name: "Dark Mode", icon: Moon, color: "text-indigo-500" },
    { id: "nerv-dark", name: "nerv-dark", icon: Palette, color: "text-primary" },
    { id: "nerv-wave", name: "nerv-wave", icon: Palette, color: "text-sky-500" },
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
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-9 w-9 rounded-full bg-card p-0 overflow-hidden border border-secondary/10 focus-visible:ring-0 focus-visible:ring-offset-0 select-none hover:bg-card active:scale-95 transition-transform"
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
                className="w-56 mt-2 bg-card border border-secondary/10 shadow-lg rounded-md"
              >
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-foreground truncate">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">Spotify Connected</p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-background" />
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer py-2 rounded-sm mx-1 text-sm font-medium transition-colors focus:bg-accent/10 data-[state=open]:bg-accent/10">
                    {theme === "dark" || theme === "nerv-dark" ? (
                      <Moon className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-500" />
                    )}
                    <span>Switch Theme</span>
                  </DropdownMenuSubTrigger>
                  
                  <DropdownMenuSubContent className="w-48 bg-card border border-secondary/10 shadow-md rounded-md p-1 mx-1">
                    {availableThemes.map((t) => (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-sm text-xs font-medium focus:bg-accent/10",
                          theme === t.id && "bg-secondary/40 text-primary font-bold"
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
                  className="flex items-center gap-2 cursor-pointer py-2 text-destructive focus:text-destructive focus:bg-destructive/10 rounded-sm m-1 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* 💡 ВИПРАВЛЕНО: Кнопка тепер повністю повторює стиль, ховер, шрифти та відступи елементів навігації */
            <button 
              onClick={login} 
              className="hidden md:flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground transition-colors cursor-pointer"
            >
              <Music className="h-4 w-4" />
              <span>Connect Spotify</span>
            </button>
          )}

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
              className="w-64 border-0 bg-background p-0 shadow-lg flex flex-col justify-between"
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

              {/* Мобільний підвал */}
              <div className="p-4 space-y-2 border-t border-secondary/10">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-10 text-sm font-medium border-secondary/20"
                  onClick={() => {
                    const currentIndex = availableThemes.findIndex(t => t.id === theme);
                    const nextIndex = (currentIndex + 1) % availableThemes.length;
                    setTheme(availableThemes[nextIndex]?.id ?? "dark");
                  }}
                >
                  <Palette className="h-5 w-5 text-primary" />
                  <span>Cycle Themes ({theme})</span>
                </Button>

                {isLoggedIn ? (
                  <Button
                    variant="destructive"
                    className="w-full gap-3 h-10 text-sm font-medium"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-10 text-sm font-medium border-secondary/30 text-muted-foreground justify-start gap-3 px-3"
                    onClick={() => {
                      login();
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