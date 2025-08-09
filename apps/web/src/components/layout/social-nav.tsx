"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Home,
  Users,
  PenSquare,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Menu,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserInfo {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface SocialNavProps {
  user?: UserInfo;
  locale: string;
}

const navigationItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
    description: "Your personal dashboard",
  },
  {
    title: "Groups",
    href: "/groups",
    icon: Users,
    description: "Browse and manage groups",
  },
  {
    title: "Posts",
    href: "/posts",
    icon: MessageCircle,
    description: "View recent posts",
  },
];

const ProfileSection = ({ user }: { user?: UserInfo }) => {
  const avatarFallback = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/edit">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/api/auth/sign-out">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MobileNavigation = ({ user, locale }: SocialNavProps) => {
  const pathname = usePathname();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex items-center space-x-2 pb-6 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Paradigma</span>
        </div>
        
        <nav className="mt-6">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === `/${locale}${item.href}`
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
            
            {/* Create Post Button for Mobile */}
            <Link
              href={`/${locale}/posts/create`}
              className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 w-full text-left"
            >
              <PenSquare className="h-4 w-4" />
              <span>Create Post</span>
            </Link>
          </div>
        </nav>
        
        {user && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback>
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                     user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const DesktopNavigation = ({ locale }: { locale: string }) => {
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-4">
      <NavigationMenu>
        <NavigationMenuList className="space-x-1">
          {navigationItems.map((item) => (
            <NavigationMenuItem key={item.href}>
              <Link href={`/${locale}${item.href}`} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    pathname === `/${locale}${item.href}` 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      
      {/* Create Post Button */}
      <Button 
        asChild
        size="sm"
        className="h-9 px-3"
      >
        <Link href={`/${locale}/posts/create`}>
          <PenSquare className="mr-2 h-4 w-4" />
          Create
        </Link>
      </Button>
    </div>
  );
};

export function SocialNav({ user, locale }: SocialNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <Link href={`/${locale}/dashboard`} className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">P</span>
              </div>
              <span className="hidden text-xl font-bold tracking-tight sm:inline-block">
                Paradigma
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              <DesktopNavigation locale={locale} />
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavigation user={user} locale={locale} />
          </div>

          {/* Right side - Search, Notifications, Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Future search functionality */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 hover:bg-muted transition-colors relative"
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
                {/* Notification badge - can be conditionally rendered */}
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
              </Button>
              <ProfileSection user={user} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}