"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Building2, Users, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Business {
  id: string
  name: string
  slug: string | null
  email: string | null
  phone: string | null
  country: string | null
  website: string | null
  createdAt: string
  memberCount: number
  subscription: {
    status: string
    planName: string
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchBusinesses = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/admin/businesses?page=${page}&limit=20`)
      if (res.status === 403) {
        toast.error("Access denied. Super admin privileges required.")
        return
      }
      if (!res.ok) throw new Error("Failed to fetch businesses")
      const data = await res.json()
      setBusinesses(data.businesses)
      setPagination(data.pagination)
    } catch {
      toast.error("Failed to load businesses")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBusinesses(1)
  }, [fetchBusinesses])

  function getSubscriptionBadge(sub: Business["subscription"]) {
    if (!sub) return <Badge variant="outline">No Plan</Badge>
    const variant =
      sub.status === "active"
        ? "default"
        : sub.status === "trialing"
        ? "secondary"
        : "destructive"
    return (
      <Badge variant={variant}>
        {sub.planName} ({sub.status})
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Businesses</h1>
          <p className="text-muted-foreground">
            View and manage all registered businesses on the platform.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {pagination.total} total
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No businesses found.
                  </TableCell>
                </TableRow>
              ) : (
                businesses.map((biz) => (
                  <TableRow key={biz.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{biz.name}</div>
                          {biz.slug && (
                            <div className="text-xs text-muted-foreground">{biz.slug}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {biz.email || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {biz.country || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {biz.memberCount}
                      </div>
                    </TableCell>
                    <TableCell>{getSubscriptionBadge(biz.subscription)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(biz.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/businesses/${biz.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchBusinesses(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchBusinesses(pagination.page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
