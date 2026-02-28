// Centralized URL helpers for subdomain architecture
// Root domain (telaven.com / localhost:3003)       → Landing page
// App subdomain (app.telaven.com / app.localhost:3003) → Dashboard, auth, API

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "localhost:3003"
const PROTOCOL = process.env.NEXT_PUBLIC_PROTOCOL || "http"

/** Root domain URL (landing page) */
export function getRootUrl() {
  return `${PROTOCOL}://${DOMAIN}`
}

/** App subdomain URL (dashboard, auth, API) */
export function getAppUrl() {
  return `${PROTOCOL}://app.${DOMAIN}`
}
