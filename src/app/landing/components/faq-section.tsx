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
    question: 'How does Annalytick connect to my Apify account?',
    answer:
      'Simply add your Apify API token in the settings page. Annalytick uses the token to sync your actors, fetch run data, and pull output datasets. Your token is encrypted at rest and never shared with third parties.',
  },
  {
    value: 'item-2',
    question: 'What is the difference between the Starter and Pro plans?',
    answer:
      'The Starter plan is free forever and includes up to 3 projects and 5 actors with basic run monitoring. The Pro plan unlocks unlimited projects and actors, real-time analytics, the unified datastore, team collaboration, cost tracking, and priority support.',
  },
  {
    value: 'item-3',
    question: 'Can I use Annalytick with public Apify actors from the store?',
    answer:
      'Yes! You can sync both your own actors and any public actor from the Apify Store. Just enter the actor ID and Annalytick will import it into your workspace so you can track runs and data alongside your own actors.',
  },
  {
    value: 'item-4',
    question: 'How does the unified datastore work?',
    answer:
      'The datastore combines output data from all successful runs for a given actor into a single, searchable table. You can filter, toggle columns, paginate through results, and export to CSV or JSON — all without writing any code.',
  },
  {
    value: 'item-5',
    question: 'Can I invite my team members?',
    answer:
      'Absolutely. On the Pro and Enterprise plans, you can invite team members by email. They will receive an invitation link, and once they sign up, they are automatically added to your organization with the appropriate role and permissions.',
  },
  {
    value: 'item-6',
    question: 'Is my data secure?',
    answer:
      'Security is a top priority. All API keys are encrypted at rest, connections use HTTPS, and we support role-based access control. Enterprise customers also get SSO/SAML support and dedicated infrastructure options.',
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
            Everything you need to know about Annalytick, Apify integration, pricing, and data security. Still have questions? We&apos;re here to help!
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
