
import type { LucideIcon } from 'lucide-react';
import { BarChart2, Settings, UserCircle as UserProfileIcon } from 'lucide-react'; // Renamed UserCircle to avoid conflict

export type NavLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

export const NAV_LINKS: NavLink[] = [
  // Home link is handled dynamically in header based on auth state (routes to / or /dashboard)
  { href: "/dashboard", label: "Dashboard" }, // Primary link when logged in
  { href: "/soft-skills", label: "Soft Skills" },
  { href: "/technical-skills", label: "Technical Skills" },
  { href: "/mock-interviews", label: "Mock Interviews" },
  { href: "/aptitude", label: "Aptitude" },
  { href: "/resume-building", label: "Resume Building" },
  { href: "/about-us", label: "About Us" }, // Could be public or protected based on preference
];

// For the dropdown menu when a user is logged in
export const PROFILE_DROPDOWN_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
  // { href: "/profile", label: "Profile", icon: UserProfileIcon }, // Example
  // { href: "/settings", label: "Settings", icon: Settings }, // Example
];

export const APP_NAME = "Elévix AI Training";
