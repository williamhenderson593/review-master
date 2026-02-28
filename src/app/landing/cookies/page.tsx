import type { Metadata } from 'next'
import { CookiesPageContent } from './cookies-content'

export const metadata: Metadata = {
  title: 'Cookie Policy - Annalytick',
  description: 'Learn about how Annalytick uses cookies and similar technologies.',
}

export default function CookiesPage() {
  return <CookiesPageContent />
}
