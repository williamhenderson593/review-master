"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, CreditCard, Key, Mail } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Stats {
  totalBusinesses: number
  totalUsers: number
  activeSubscriptions: number
  activeApiKeys: number
  pendingInvites: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/v1/admin/stats")
        if (res.status === 403) {
          toast.error("Access denied. Super admin privileges required.")
          return
        }
        if (!res.ok) throw new Error("Failed to fetch stats")
        const data = await res.json()
        setStats(data.stats)
      } catch {
        toast.error("Failed to load admin stats")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = stats
    ? [
        {
          title: "Total Businesses",
          value: stats.totalBusinesses,
          icon: Building2,
          href: "/admin/businesses",
        },
        {
          title: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          href: "/admin/users",
        },
        {
          title: "Active Subscriptions",
          value: stats.activeSubscriptions,
          icon: CreditCard,
          href: "/admin/businesses",
        },
        {
          title: "Active API Keys",
          value: stats.activeApiKeys,
          icon: Key,
          href: "#",
        },
        {
          title: "Pending Invites",
          value: stats.pendingInvites,
          icon: Mail,
          href: "#",
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Super Admin</h1>
        <p className="text-muted-foreground">
          Platform-wide overview of all businesses and users.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Unable to load stats. Make sure you have super admin access.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
