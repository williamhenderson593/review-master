"use client"

import * as React from "react"
import {
  LayoutPanelLeft,
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  Settings,
  HelpCircle,
  CreditCard,
  Users,
  UserPlus,
  Key,
  Building2,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"

function useProfileData() {
  const [businessName, setBusinessName] = React.useState<string>("Dashboard")
  const [roleName, setRoleName] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch("/api/v1/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.client?.name) {
          setBusinessName(data.user.client.name)
        }
        if (data.user?.role?.name) {
          setRoleName(data.user.role.name)
        }
      })
      .catch(() => {})
  }, [])

  return { businessName, roleName }
}

const data = {
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Dashboard 2",
          url: "/dashboard-2",
          icon: LayoutPanelLeft,
        },
      ],
    },
    {
      label: "Apps",
      items: [
        {
          title: "Mail",
          url: "/mail",
          icon: Mail,
        },
        {
          title: "Tasks",
          url: "/tasks",
          icon: CheckSquare,
        },
        {
          title: "Chat",
          url: "/chat",
          icon: MessageCircle,
        },
        {
          title: "Calendar",
          url: "/calendar",
          icon: Calendar,
        },
        {
          title: "Users",
          url: "/users",
          icon: Users,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "Team Members",
          url: "/settings/members",
          icon: UserPlus,
        },
        {
          title: "API Keys",
          url: "/settings/api-keys",
          icon: Key,
        },
        {
          title: "Settings",
          url: "#",
          icon: Settings,
          items: [
            {
              title: "Account Settings",
              url: "/settings/account",
            },
            {
              title: "Plans & Billing",
              url: "/settings/billing",
            },
            {
              title: "Appearance",
              url: "/settings/appearance",
            },
            {
              title: "Notifications",
              url: "/settings/notifications",
            },
          ],
        },
        {
          title: "FAQs",
          url: "/faqs",
          icon: HelpCircle,
        },
        {
          title: "Pricing",
          url: "/pricing",
          icon: CreditCard,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const { businessName, roleName } = useProfileData()

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  }

  // Build nav groups, injecting admin items into Dashboards group for super admins
  const navGroups = React.useMemo(() => {
    if (roleName !== "super_admin") return data.navGroups

    return data.navGroups.map((group) => {
      if (group.label === "Dashboards") {
        return {
          ...group,
          items: [
            ...group.items,
            {
              title: "Businesses",
              url: "/admin/businesses",
              icon: Building2,
            },
            {
              title: "All Users",
              url: "/admin/users",
              icon: Users,
            },
          ],
        }
      }
      return group
    })
  }, [roleName])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{businessName}</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
