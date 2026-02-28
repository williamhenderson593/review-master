"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Plus, Trash2, Mail, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Invite {
  id: string
  email: string
  status: string
  expiresAt: string
  acceptedAt: string | null
  createdAt: string
  invitedByName: string | null
  roleName: string | null
}

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">Pending</Badge>
    case "accepted":
      return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20">Accepted</Badge>
    case "expired":
      return <Badge variant="outline" className="text-gray-500 border-gray-300 bg-gray-50 dark:bg-gray-900/20">Expired</Badge>
    case "revoked":
      return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 dark:bg-red-900/20">Revoked</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function MembersPage() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchInvites = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/invites")
      const data = await res.json()
      if (res.ok) {
        setInvites(data.invites || [])
      }
    } catch {
      console.error("Failed to fetch invites")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/v1/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send invite")
        toast.error(data.error || "Failed to send invite")
        return
      }

      toast.success(data.message || "Invitation sent successfully!")
      setSuccess(data.message || "Invitation sent successfully!")
      setEmail("")
      setDialogOpen(false)
      fetchInvites()
    } catch {
      setError("Failed to send invite")
      toast.error("Failed to send invite")
    } finally {
      setSending(false)
    }
  }

  async function handleRevokeInvite(id: string) {
    try {
      const res = await fetch(`/api/v1/invites/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchInvites()
        toast.success("Invite revoked successfully")
        setSuccess("Invite revoked successfully")
      }
    } catch {
      setError("Failed to revoke invite")
      toast.error("Failed to revoke invite")
    }
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your team member invitations.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSendInvite}>
              <DialogHeader>
                <DialogTitle>Invite a Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation email to add a new member to your team.
                  They will be assigned the &quot;member&quot; role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={sending}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={sending} className="cursor-pointer">
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">
            &times;
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            View and manage all member invitations. Pending invites expire after 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No invitations yet.</p>
              <p className="text-sm">Click &quot;Invite Member&quot; to send your first invitation.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>{statusBadge(invite.status)}</TableCell>
                    <TableCell className="capitalize">{invite.roleName || "member"}</TableCell>
                    <TableCell>{invite.invitedByName || "—"}</TableCell>
                    <TableCell>{format(new Date(invite.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(invite.expiresAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      {invite.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive cursor-pointer"
                          onClick={() => handleRevokeInvite(invite.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
