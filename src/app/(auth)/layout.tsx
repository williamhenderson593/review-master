import type { Metadata } from "next";
import { ThemeReset } from "@/components/theme-reset";

export const metadata: Metadata = {
  title: "Authentication - Telaven",
  description: "Sign in to your account or create a new one",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ThemeReset />
      {children}
    </div>
  );
}
