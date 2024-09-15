import {
  BookOpen,
  Home,
  LineChart,
  LucideIcon,
  Settings,
  Users,
  Users2,
} from "lucide-react";

interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

export const menuItems: MenuItem[] = [
  { name: "Home", icon: Home, href: "/home" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Subjects", icon: BookOpen, href: "/subjects" },
  { name: "Tutors", icon: Users2, href: "#" },
  { name: "Analytics", icon: LineChart, href: "#" },
];

export const footerItems: MenuItem[] = [
  { name: "Settings", icon: Settings, href: "#" },
];
