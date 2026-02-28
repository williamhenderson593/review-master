import type { Metadata } from 'next'
import { SecurityPageContent } from './security-content'

export const metadata: Metadata = {
  title: 'Security - Annalytick',
  description: 'Learn about the security measures Annalytick implements to protect your data and accounts.',
}

export default function SecurityPage() {
  return <SecurityPageContent />
}
