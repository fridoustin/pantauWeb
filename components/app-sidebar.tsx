"use client"
import { Calendar, Home, Briefcase, UserPlus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useUser } from "@/contexts/userContext"
import { memo, useEffect, useState, ElementType } from "react"
import Link from "next/link"

// Define the item type
interface MenuItem {
  title: string;
  url: string;
  icon: ElementType;
}

// Menu items.
const items: MenuItem[] = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Meeting Room Booking",
    url: "/meetings-rooms",
    icon: Calendar,
  },
  {
    title: "Work Order",
    url: "/work-order",
    icon: Briefcase,
  },
  {
    title: "Add Technician",
    url: "/add-technician",
    icon: UserPlus,
  },
  {
    title: "Theme Switcher",
    url: "#",
    icon: ThemeSwitcher,
  }
]

// Component for user section with client-side only rendering
const UserSection = memo(function UserSection() {
  const { user, loading } = useUser()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // During SSR or before hydration, return a placeholder with same height
  if (!mounted) {
    return (
      <div className="p-4 min-h-[64px]"></div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[64px]">
        <span className="text-sm">Loading...</span>
      </div>
    )
  }
  
  return user ? <NavUser user={user} /> : null
})

// Menu items component to avoid unnecessary re-renders
const MenuItems = memo(function MenuItems() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // During SSR, return a placeholder
  if (!mounted) {
    return <div className="min-h-[200px]"></div>
  }
  
  return (
    <SidebarMenu>
      {items.map((item) => {
        const IconComponent = item.icon;
        
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              {item.title === "Theme Switcher" ? (
                <ThemeSwitcher />
              ) : (
                <Link href={item.url} className="flex items-center gap-2 w-full px-4 py-2">
                  <IconComponent size={16} />
                  <span>{item.title}</span>
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  )
})

export function AppSidebar() {
  return (
    <Sidebar suppressHydrationWarning>
      <SidebarHeader>
        <UserSection />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Feature</SidebarGroupLabel>
          <SidebarGroupContent>
            <MenuItems />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}