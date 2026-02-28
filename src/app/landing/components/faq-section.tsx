"use client"

import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: 'item-1',
    question: 'Which review platforms does ReviewFlow support?',
    answer:
      'ReviewFlow supports 15+ platforms including Google Business, TripAdvisor, G2, Capterra, Trustpilot, App Store, Play Store, Software Advice, Gartner Peer Insights, TrustRadius, Shopify App Store, WordPress Plugin Directory, Salesforce AppExchange, HubSpot Marketplace, and Pipedrive Marketplace. We are constantly adding more.',
  },
  {
    value: 'item-2',
    question: 'How does review collection work?',
    answer:
      'ReviewFlow connects to each platform via their official APIs or web monitoring. New reviews are automatically pulled into your unified inbox in real time. You can also set up webhooks for instant notifications. No manual checking required.',
  },
  {
    value: 'item-3',
    question: 'What is a Magic Link and how does review generation work?',
    answer:
      'A Magic Link is a smart URL that routes customers to the best review platform based on your goals — for example, balancing reviews across platforms or targeting the platform where your rating is lowest. You can share magic links via email, SMS, QR code, or embed them in your product. The reputation protection feature routes unhappy customers to private feedback before they post publicly.',
  },
  {
    value: 'item-4',
    question: 'Can I respond to reviews directly from ReviewFlow?',
    answer:
      'Yes! For supported platforms (Google, Trustpilot, and others), you can write and publish replies directly from the ReviewFlow dashboard. For other platforms, we provide a reply composer with AI suggestions that you can copy and paste. AI reply suggestions are based on the review content, rating, sentiment, and platform.',
  },
  {
    value: 'item-5',
    question: 'How does the Slack integration work?',
    answer:
      'Connect your Slack workspace and choose which channels to post reviews to. You can configure filters — for example, only post 1-3 star reviews to your support channel, and all reviews to a general #reviews channel. Your team gets real-time visibility into customer feedback without leaving Slack.',
  },
  {
    value: 'item-6',
    question: 'Is there a free trial? Do I need a credit card?',
    answer:
      'Yes — all paid plans include a 14-day free trial with no credit card required. The Starter plan is free forever with limited features. You can upgrade, downgrade, or cancel at any time.',
  },
  {
    value: 'item-7',
    question: 'Can I manage multiple brands or clients?',
    answer:
      'Yes. The Enterprise plan supports multiple brand workspaces within one organization — perfect for agencies managing multiple clients or companies with multiple product lines. Each workspace has its own review profiles, campaigns, and settings.',
  },
  {
    value: 'item-8',
    question: 'Is my data secure?',
    answer:
      'Security is a top priority. All OAuth tokens and credentials are encrypted at rest. Connections use HTTPS. We support role-based access control (Admin, Editor, Viewer) and maintain an audit log of all actions. Enterprise customers get SSO/SAML support.',
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about ReviewFlow, supported platforms, pricing, and integrations. Still have questions? We&apos;re here to help!
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className='bg-transparent'>
            <div className='p-0'>
              <Accordion type='single' collapsible className='space-y-5'>
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value} className='rounded-md !border bg-transparent'>
                    <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                          <CircleHelp className='size-5' />
                        </div>
                        <span className='text-start font-semibold'>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-4 bg-transparent'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions? We&apos;re here to help.
            </p>
            <Button className='cursor-pointer' asChild>
              <a href="#contact">
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
