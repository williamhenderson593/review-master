"use client"

import { useEffect } from "react"

/**
 * Resets all inline CSS variable overrides on document.documentElement.
 * This ensures pages using this component always render with the default
 * shadcn/ui theme from globals.css, regardless of theme customizer state.
 *
 * Place this component in layouts that should not be affected by the
 * theme customizer (e.g., auth pages, landing page).
 */
export function ThemeReset() {
  useEffect(() => {
    const root = document.documentElement
    const inlineStyles = root.style

    // Collect all custom properties set inline
    const customProps: string[] = []
    for (let i = 0; i < inlineStyles.length; i++) {
      const prop = inlineStyles[i]
      if (prop.startsWith("--")) {
        customProps.push(prop)
      }
    }

    // Remove them all
    customProps.forEach((prop) => {
      root.style.removeProperty(prop)
    })

    // Re-apply on cleanup if user navigates back to customizer pages
    // (no-op — the customizer will re-apply its own styles)
  }, [])

  return null
}
