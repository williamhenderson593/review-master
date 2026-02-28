"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Loader2, Plus, Trash2, Key, Copy, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  isActive: boolean
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null)
  const [deleteKeyName, setDeleteKeyName] = useState<string>("")
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/api-keys")
      const data = await res.json()
      if (res.ok) {
        setKeys(data.keys || [])
      }
    } catch {
      console.error("Failed to fetch API keys")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create API key")
        toast.error(data.error || "Failed to create API key")
        return
      }

      setNewKey(data.key.rawKey)
      setName("")
      toast.success("API key created successfully!")
      fetchKeys()
    } catch {
      setError("Failed to create API key")
      toast.error("Failed to create API key")
    } finally {
      setCreating(false)
    }
  }

  function openDeleteDialog(id: string, name: string) {
    setDeleteKeyId(id)
    setDeleteKeyName(name)
    setDeleteConfirmText("")
    setDeleteDialogOpen(true)
  }

  async function handleDeleteKey() {
    if (!deleteKeyId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/v1/api-keys/${deleteKeyId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("API key deleted successfully")
        setDeleteDialogOpen(false)
        setDeleteKeyId(null)
        setDeleteConfirmText("")
        fetchKeys()
      } else {
        toast.error("Failed to delete API key")
      }
    } catch {
      setError("Failed to delete API key")
      toast.error("Failed to delete API key")
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleKey(id: string) {
    try {
      const res = await fetch(`/api/v1/api-keys/${id}`, { method: "PATCH" })
      if (res.ok) {
        const data = await res.json()
        toast.success(data.message || "API key updated")
        fetchKeys()
      } else {
        toast.error("Failed to update API key")
      }
    } catch {
      setError("Failed to update API key")
      toast.error("Failed to update API key")
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic access.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) { setNewKey(null); setError(null) }
        }}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            {newKey ? (
              <>
                <DialogHeader>
                  <DialogTitle>API Key Created</DialogTitle>
                  <DialogDescription>
                    Copy your API key now. You won&apos;t be able to see it again.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    <Input value={newKey} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 cursor-pointer"
                      onClick={() => copyToClipboard(newKey)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Store this key securely. It provides access to your account&apos;s API.
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={() => { setDialogOpen(false); setNewKey(null) }} className="cursor-pointer">
                    Done
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <form onSubmit={handleCreateKey}>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Give your API key a descriptive name so you can identify it later.
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
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Production API, Mobile App"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={creating}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating} className="cursor-pointer">
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Create Key
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            API keys are used for authenticating API requests. Keep them secret.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No API keys yet.</p>
              <p className="text-sm">Click &quot;Create API Key&quot; to generate your first key.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{key.keyPrefix}</TableCell>
                    <TableCell>
                      {key.isActive ? (
                        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-gray-300 bg-gray-50 dark:bg-gray-900/20">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(key.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>{key.lastUsedAt ? format(new Date(key.lastUsedAt), "MMM d, yyyy") : "Never"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleToggleKey(key.id)}
                      >
                        {key.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive cursor-pointer"
                        onClick={() => openDeleteDialog(key.id, key.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open)
        if (!open) { setDeleteConfirmText(""); setDeleteKeyId(null) }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              This action is irreversible. The API key <strong>&quot;{deleteKeyName}&quot;</strong> will be permanently deleted and any applications using it will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Type <strong>delete</strong> below to confirm this action.</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="delete-confirm">Confirmation</Label>
              <Input
                id="delete-confirm"
                placeholder="Type 'delete' to confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                disabled={deleting}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmText("") }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteKey}
              disabled={deleteConfirmText !== "delete" || deleting}
              className="cursor-pointer"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
