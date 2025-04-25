"use client"

import { Calendar, Home, Inbox, Search, Settings, Briefcase, ClipboardList } from "lucide-react"

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
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client" 


// Menu items.
const items = [
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
]

export function AppSidebar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error("Gagal mengambil user:", error.message)
        return
      }

      if (data?.user) {
        const name = data.user.user_metadata?.name || "No Name"
        const email = data.user.email ?? "no-email@example.com"
        setUser({ name, email })
      }
    }

    fetchUser()
  }, [])
  return (
    <Sidebar>
      <SidebarHeader>
        {user && <NavUser user={user} />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Feature</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
