
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Search, UserCircle, X, Briefcase, Brain, Users, FileText, Info, LineChart, Settings, LogOut, LogIn, UserPlus, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NAV_LINKS, PROFILE_DROPDOWN_LINKS, APP_NAME } from "@/lib/constants";
import type { NavLink } from "@/lib/constants";
import { ElevixLogoText } from "@/components/icons/logo";
import { cn } from "@/lib/utils";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { useToast } from "@/hooks/use-toast";


const navIcons: { [key: string]: React.ElementType } = {
  Home: Briefcase, 
  "Soft Skills": Users,
  "Technical Skills": Brain, 
  "Mock Interviews": LineChart, 
  Aptitude: FileText, 
  "Resume Building": FileText,
  Dashboard: BarChart2,
  "About Us": Info,
};


export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const user = localStorage.getItem('loggedInUser');
    setLoggedInUser(user);
  }, []);
  
  // Effect to update loggedInUser state if localStorage changes (e.g., login/logout on another tab)
  // This is a basic way to attempt to sync. Real apps use more robust session management.
  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem('loggedInUser');
      setLoggedInUser(user);
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check on path change, in case login/logout happens without storage event
    const user = localStorage.getItem('loggedInUser');
    setLoggedInUser(user);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);


  if (!isMounted) {
    // Avoid rendering anything until client-side mount to prevent hydration mismatch with localStorage
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
             <Link href="/" className="flex items-center gap-2">
              <ElevixLogoText className="text-2xl" />
            </Link>
            {/* Placeholder for nav links or loading indicator could go here */}
          </div>
        </div>
      </header>
    );
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setLoggedInUser(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
    closeMobileMenu();
  };
  
  const mainNavLinks = loggedInUser ? NAV_LINKS.filter(link => link.href !== '/about-us') : NAV_LINKS;
  const mobileNavLinks = loggedInUser ? NAV_LINKS : NAV_LINKS.filter(link => link.href !== '/dashboard');


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center">
            <Link href={loggedInUser ? "/dashboard" : "/"} className="flex items-center gap-2" onClick={closeMobileMenu}>
              <ElevixLogoText className="text-2xl" />
            </Link>
            <nav className="hidden md:ml-6 md:flex md:space-x-4">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Central Search Bar - more prominent on larger screens */}
          <div className="hidden lg:flex flex-1 justify-center px-12">
            <div className="w-full max-w-md">
              <Input
                type="search"
                placeholder="Search courses, skills..."
                className="h-9"
              />
            </div>
          </div>
          
          {/* Auth Links, Profile and Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="lg:hidden">
               <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {!loggedInUser && (
              <>
                <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Log In
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </Link>
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/100x100.png" alt={loggedInUser || "User profile"} data-ai-hint="person avatar" />
                    <AvatarFallback>
                      {loggedInUser ? loggedInUser.charAt(0).toUpperCase() : <UserCircle className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{loggedInUser || "Guest User"}</p>
                    {!loggedInUser && (
                      <p className="text-xs leading-none text-muted-foreground">
                        Please log in or sign up
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PROFILE_DROPDOWN_LINKS.map((link) => {
                  // Only show Dashboard if logged in, or if it's another public profile link
                  if (link.href === "/dashboard" && !loggedInUser) return null;
                  return (
                    <DropdownMenuItem key={link.label} asChild>
                      <Link href={link.href} className="flex items-center gap-2">
                        {link.icon && <link.icon className="h-4 w-4" />}
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                
                {loggedInUser ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuSeparator className="sm:hidden" />
                    <DropdownMenuItem asChild className="sm:hidden cursor-pointer">
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" /> Log In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="sm:hidden cursor-pointer">
                      <Link href="/signup" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" /> Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs bg-background p-0">
                  <SheetPrimitive.Title className="sr-only">Mobile Menu</SheetPrimitive.Title>
                  <SheetPrimitive.Description className="sr-only">
                    Main navigation links for the application.
                  </SheetPrimitive.Description>
                  <div className="flex h-full flex-col">
                    <SheetHeader className="flex flex-row items-center justify-between border-b p-4">
                       <SheetTitle asChild> 
                        <Link href={loggedInUser ? "/dashboard" : "/"} className="flex items-center gap-2" onClick={closeMobileMenu}>
                          <ElevixLogoText className="text-xl" />
                        </Link>
                       </SheetTitle>
                    </SheetHeader>
                    <nav className="flex-1 space-y-2 p-4">
                      {mobileNavLinks.map((link) => {
                        const Icon = navIcons[link.label] || Briefcase; // Default icon
                        return (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={closeMobileMenu}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors",
                              pathname === link.href
                                ? "bg-primary/10 text-primary"
                                : "text-foreground/80 hover:bg-primary/5 hover:text-primary"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            {link.label}
                          </Link>
                        );
                      })}
                       {!loggedInUser && (
                        <>
                          <hr className="my-2"/>
                          <Link
                            href="/login"
                            onClick={closeMobileMenu}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors text-foreground/80 hover:bg-primary/5 hover:text-primary"
                            )}
                          >
                            <LogIn className="h-5 w-5" /> Log In
                          </Link>
                          <Link
                            href="/signup"
                            onClick={closeMobileMenu}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors text-foreground/80 hover:bg-primary/5 hover:text-primary"
                            )}
                          >
                             <UserPlus className="h-5 w-5" /> Sign Up
                          </Link>
                        </>
                       )}
                    </nav>
                    {loggedInUser && (
                       <div className="mt-auto border-t p-4">
                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                          <LogOut className="mr-2 h-5 w-5" /> Log Out
                        </Button>
                      </div>
                    )}
                     <div className="mt-auto border-t p-4">
                        <Input type="search" placeholder="Search..." className="h-9" />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
