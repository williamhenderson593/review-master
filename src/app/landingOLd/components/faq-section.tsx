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
    question: 'How do I get started with Telaven?',
    answer:
      'Getting started is easy! Sign up for a free account, set up your business profile, and invite your team members. You can start managing your operations immediately with our Basic plan at no cost.',
  },
  {
    value: 'item-2',
    question: 'What\'s the difference between the free and paid plans?',
    answer:
      'The Basic plan is free forever and includes core features like team management, a dashboard, and basic API access. Professional and Enterprise plans unlock advanced analytics, priority support, higher API limits, and custom integrations.',
  },
  {
    value: 'item-3',
    question: 'How secure is my data on Telaven?',
    answer:
      'Security is our top priority. All data is encrypted at rest and in transit using enterprise-grade encryption. API keys are hashed and stored securely. We support role-based access control so you can manage exactly who sees what.',
  },
  {
    value: 'item-4',
    question: 'Can I invite team members to my account?',
    answer:
      'Yes! You can invite unlimited team members via email. Each member can be assigned a role (admin, member, or viewer) to control their access level. Invitations expire after 7 days and can be revoked at any time.',
  },
  {
    value: 'item-5',
    question: 'Do you offer an API for integration?',
    answer:
      'Absolutely! Telaven provides a RESTful API with secure API key authentication. You can generate and manage API keys from your dashboard, set expiration dates, and monitor usage — all programmatically.',
  },
  {
    value: 'item-6',
    question: 'What kind of support do you provide?',
    answer:
      'All plans include community support. Professional and Enterprise plans include priority email support with guaranteed response times. We also provide detailed documentation and onboarding assistance to get your team up and running.',
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
            Everything you need to know about Telaven, pricing, and getting started. Still have questions? We&apos;re here to help!
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
