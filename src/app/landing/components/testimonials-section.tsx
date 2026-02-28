"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Quote } from 'lucide-react'

type Testimonial = {
  name: string
  role: string
  image: string
  quote: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Mitchell',
    role: 'Head of Marketing, CloudBase SaaS',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-1',
    quote:
      'ReviewFlow replaced our manual process of checking 8 different platforms every morning. Now everything is in one inbox and we respond to reviews 3x faster.',
  },
  {
    name: 'James Oduor',
    role: 'VP Customer Success, Growthly',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
    quote: 'The AI reply suggestions are incredible. Our team went from dreading review responses to handling them in seconds. Our response rate went from 20% to 85%.',
  },
  {
    name: 'Priya Sharma',
    role: 'Product Manager, Stackify',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-2',
    quote:
      'The sentiment analytics helped us identify that "onboarding" was our biggest pain point. We fixed it and our G2 rating went from 3.8 to 4.6 in 3 months.',
  },
  {
    name: 'Robert Chen',
    role: 'CEO, DevTools Pro',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-2',
    quote:
      'We used the review generation campaigns to go from 45 G2 reviews to 200+ in 60 days. The magic link feature made it incredibly easy for customers to leave reviews.',
  },
  {
    name: 'Maria Santos',
    role: 'Digital Marketing Lead, HotelGroup',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-3',
    quote:
      'Managing TripAdvisor, Google, and Booking.com reviews for 12 properties used to take our team all day. ReviewFlow cut that to under an hour.',
  },
  {
    name: 'Thomas Wekesa',
    role: 'Founder, B2B SaaS Startup',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-3',
    quote: 'The Slack integration is a game-changer. Our whole team sees new reviews in real time and we celebrate 5-star reviews together. It has changed our culture.',
  },
  {
    name: 'Lisa Achieng',
    role: 'Customer Experience Manager',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-4',
    quote:
      'The "needs action" feature automatically flags reviews that require a response. Nothing falls through the cracks anymore. Our customers notice the difference.',
  },
  {
    name: 'Michael Kamau',
    role: 'Growth Lead, FinTech Platform',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-4',
    quote: 'We embed the review widget on our pricing page and it converts like crazy. Showing real customer reviews right where people are deciding to buy is powerful.',
  },
  {
    name: 'Sophie Wanjiku',
    role: 'Agency Owner, Digital Reputation Co.',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-5',
    quote:
      'I manage review management for 15 clients. ReviewFlow\'s multi-brand workspaces let me handle everything from one account. My clients love the weekly digest reports.',
  },
  {
    name: 'Daniel Otieno',
    role: 'COO, E-commerce Platform',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-5',
    quote: 'The competitor tracking feature showed us exactly where we were losing ground on Capterra. We fixed those issues and closed the gap within a quarter.',
  },
  {
    name: 'Natasha Omondi',
    role: 'Head of Product, SaaS Company',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-6',
    quote:
      'ReviewFlow\'s topic extraction automatically tags reviews by theme. We now have a live feed of what customers say about pricing, support, and UX — invaluable for roadmap planning.',
  },
  {
    name: 'Carlos Rivera',
    role: 'Marketing Director, B2B Software',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-6',
    quote: 'The testimonial library is something I didn\'t know I needed. Our sales team now pulls quotes directly from ReviewFlow for proposals. Closed deals faster.',
  },
]

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex w-[380px] shrink-0 flex-col justify-between rounded-xl border bg-card p-6">
      <div>
        <Quote className="size-8 text-muted-foreground/30 mb-4" />
        <p className="text-sm leading-relaxed text-foreground">
          {testimonial.quote}
        </p>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage
            alt={testimonial.name}
            src={testimonial.image}
            loading="lazy"
          />
          <AvatarFallback>
            {testimonial.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{testimonial.role}</p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const row1 = testimonials.slice(0, 6)
  const row2 = testimonials.slice(6, 12)

  return (
    <section id="testimonials" className="py-24 sm:py-32">
      {/* Section Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
            Testimonial
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by SaaS and B2B teams everywhere
          </h2>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1 — scrolls left */}
        <div className="relative mb-4 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="flex animate-marquee-left gap-4 hover:[animation-play-state:paused]">
            {[...row1, ...row1].map((testimonial, i) => (
              <TestimonialCard key={`r1-${i}`} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="flex animate-marquee-right gap-4 hover:[animation-play-state:paused]">
            {[...row2, ...row2].map((testimonial, i) => (
              <TestimonialCard key={`r2-${i}`} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
