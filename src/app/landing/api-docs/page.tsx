import type { Metadata } from 'next'
import { ApiDocsPageContent } from './api-docs-content'

export const metadata: Metadata = {
  title: 'API Documentation - Annalytick',
  description: 'Complete API reference for accessing your Annalytick project data programmatically.',
}

export default function ApiDocsPage() {
  return <ApiDocsPageContent />
}
