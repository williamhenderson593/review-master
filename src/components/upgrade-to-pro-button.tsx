"use client"

import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { Rocket, ArrowRight, Zap, Users, BarChart3 } from "lucide-react"

export function UpgradeToProButton() {
  return (
    <div className="fixed z-50 bottom-8 right-4 md:right-6 lg:right-8 flex flex-col items-end gap-2">
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Button
            size="lg"
            className="px-6 py-3 bg-gradient-to-br shadow-lg from-slate-900 cursor-pointer to-slate-400 text-white font-bold"
            style={{ minWidth: 180 }}
            onClick={() => typeof window !== "undefined" && (window.location.href = "#pricing")}
          >
            Upgrade Plan
            <Rocket size={30} className="ml-1" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="mb-3 w-80 rounded-xl shadow-2xl bg-background border border-border p-4 animate-in fade-in slide-in-from-bottom-4 relative mr-4 md:mr-6 lg:mr-8">
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Rocket size={18} className="text-primary" />
              Upgrade Your Plan
            </h3>
            <p className="text-muted-foreground text-sm">
              Unlock advanced features to grow your business faster.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Zap size={14} className="text-primary" />
                Higher API rate limits
              </li>
              <li className="flex items-center gap-2">
                <Users size={14} className="text-primary" />
                Unlimited team members
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 size={14} className="text-primary" />
                Advanced analytics & reports
              </li>
            </ul>
            <Button className="w-full cursor-pointer mt-1" asChild>
              <a href="#pricing" className="flex items-center justify-center">
                View Plans
                <ArrowRight size={16} className="ml-2" />
              </a>
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
