"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Star,
  MessageSquare,
  BarChart3,
  Zap,
  Send,
  Users,
  Plug,
  Code2,
  Settings,
  HelpCircle,
  CreditCard,
  UserPlus,
  Key,
  Building2,
  Globe,
  Bell,
  Lightbulb,
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
  const [businessName, setBusinessName] = React.useState<string>("ReviewFlow")
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
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: BarChart3,
        },
        {
          title: "Insights",
          url: "/insights",
          icon: Lightbulb,
        },
      ],
    },
    {
      label: "Reviews",
      items: [
        {
          title: "Review Profiles",
          url: "/review-profiles",
          icon: Globe,
        },
        {
          title: "All Reviews",
          url: "/reviews",
          icon: Star,
        },
        {
          title: "Automations",
          url: "/automations",
          icon: Zap,
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
          icon: Bell,
        },
      ],
    },
    {
      label: "Review Generation",
      items: [
        {
          title: "Campaigns",
          url: "/campaigns",
          icon: Send,
        },
        {
          title: "Contacts",
          url: "/contacts",
          icon: Users,
        },
      ],
    },
    {
      label: "Showcase",
      items: [
        {
          title: "Widgets",
          url: "/widgets",
          icon: Code2,
        },
      ],
    },
    {
      label: "Connect",
      items: [
        {
          title: "Integrations",
          url: "/integrations",
          icon: Plug,
        },
      ],
    },
    {
      label: "Account",
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

  // Build nav groups, injecting admin items for super admins
  const navGroups = React.useMemo(() => {
    if (roleName !== "super_admin") return data.navGroups

    return [
      ...data.navGroups,
      {
        label: "Super Admin",
        items: [
          {
            title: "Admin Dashboard",
            url: "/admin",
            icon: Building2,
          },
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
          {
            title: "All Reviews",
            url: "/admin/reviews",
            icon: Star,
          },
        ],
      },
    ]
  }, [roleName])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Star size={16} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{businessName}</span>
                  <span className="truncate text-xs text-muted-foreground">Review Management</span>
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
