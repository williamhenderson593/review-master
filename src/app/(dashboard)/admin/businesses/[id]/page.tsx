"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { ArrowLeft, Building2, Users, Key, Mail, CreditCard, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Business {
  id: string
  name: string
  slug: string | null
  email: string | null
  phone: string | null
  country: string | null
  address: string | null
  website: string | null
  createdAt: string
}

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  country: string | null
  emailVerified: boolean
  roleName: string | null
  createdAt: string
}

interface Subscription {
  id: string
  status: string
  planName: string
  planPrice: number
  currentPeriodStart: string
  currentPeriodEnd: string | null
}

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  isActive: boolean
  createdAt: string
  lastUsedAt: string | null
}

interface Invite {
  id: string
  email: string
  status: string
  createdAt: string
}

interface BusinessDetail {
  business: Business
  members: Member[]
  subscription: Subscription | null
  apiKeys: ApiKey[]
  invites: Invite[]
}

export default function AdminBusinessDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<BusinessDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBusiness = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/admin/businesses/${id}`)
      if (res.status === 403) {
        toast.error("Access denied. Super admin privileges required.")
        return
      }
      if (res.status === 404) {
        toast.error("Business not found.")
        return
      }
      if (!res.ok) throw new Error("Failed to fetch business")
      const json = await res.json()
      setData(json)
    } catch {
      toast.error("Failed to load business details")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBusiness()
  }, [fetchBusiness])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-4 w-24 bg-muted rounded" /></CardHeader>
              <CardContent><div className="h-6 w-16 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/admin/businesses"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Business not found or access denied.
          </CardContent>
        </Card>
      </div>
    )
  }

  const { business, members, subscription, apiKeys, invites } = data

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/businesses"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {business.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {business.slug && `@${business.slug} · `}
            Created {new Date(business.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Business Info + Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Members
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{members.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" /> Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription?.planName || "None"}</div>
            {subscription && (
              <Badge variant={subscription.status === "active" ? "default" : "destructive"} className="mt-1">
                {subscription.status}
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Key className="h-3.5 w-3.5" /> API Keys
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{apiKeys.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invites.filter((i) => i.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{business.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{business.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Country</dt>
              <dd className="font-medium">{business.country || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Website</dt>
              <dd className="font-medium">{business.website || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-medium">{business.address || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Members ({members.length})
          </CardTitle>
          <CardDescription>All users belonging to this business.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.roleName || "No role"}</Badge>
                    </TableCell>
                    <TableCell>
                      {m.emailVerified ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" /> API Keys ({apiKeys.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No API keys.
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="font-mono text-xs">{k.keyPrefix}...</TableCell>
                    <TableCell>
                      <Badge variant={k.isActive ? "default" : "destructive"}>
                        {k.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invites Table */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Invites ({invites.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === "pending"
                            ? "secondary"
                            : inv.status === "accepted"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
