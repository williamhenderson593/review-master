"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link. No token provided.")
      return
    }

    // Better Auth handles verification via the token automatically through its API
    // The token in the URL is processed by Better Auth's built-in verification endpoint
    // We just need to show the result
    async function verifyEmail() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`)
        if (res.ok || res.redirected) {
          setStatus("success")
          setMessage("Your email has been verified successfully!")
        } else {
          setStatus("error")
          setMessage("Verification failed. The link may have expired or is invalid.")
        }
      } catch {
        setStatus("error")
        setMessage("An error occurred during verification. Please try again.")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <Logo size={24} />
          </div>
          Telaven
        </Link>
        <Card>
          <CardHeader className="text-center">
            {status === "loading" && (
              <>
                <div className="mx-auto mb-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <CardTitle className="text-xl">Verifying your email...</CardTitle>
                <CardDescription>Please wait while we verify your email address.</CardDescription>
              </>
            )}
            {status === "success" && (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Email Verified!</CardTitle>
                <CardDescription>{message}</CardDescription>
              </>
            )}
            {status === "error" && (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-xl">Verification Failed</CardTitle>
                <CardDescription>{message}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {status === "success" && (
              <Button className="w-full cursor-pointer" onClick={() => router.push("/sign-in")}>
                Continue to Sign In
              </Button>
            )}
            {status === "error" && (
              <div className="space-y-3">
                <Button className="w-full cursor-pointer" variant="outline" onClick={() => router.push("/sign-up")}>
                  Back to Sign Up
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
