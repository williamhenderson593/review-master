import type { Metadata } from 'next'
import { DpaPageContent } from './dpa-content'

export const metadata: Metadata = {
  title: 'Data Processing Agreement - Annalytick',
  description: 'Annalytick Data Processing Agreement for GDPR and data protection compliance.',
}

export default function DpaPage() {
  return <DpaPageContent />
}
