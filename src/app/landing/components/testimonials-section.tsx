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
    name: 'Grace Muthoni',
    role: 'Data Engineering Lead',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-1',
    quote:
      'Annalytick replaced our messy spreadsheets and Slack threads. Now we have a single dashboard for every actor, every run, and every data point. Our team saves hours every week.',
  },
  {
    name: 'James Oduor',
    role: 'Head of Growth',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
    quote: 'The cost tracking alone paid for the subscription. We finally know exactly how much each scraping project costs us.',
  },
  {
    name: 'Priya Sharma',
    role: 'Product Analyst',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-2',
    quote:
      'The unified datastore is a game-changer. I can search across millions of scraped records, toggle columns, and export exactly what I need — no engineering help required.',
  },
  {
    name: 'Robert Njeru',
    role: 'CTO, DataHarvest',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-2',
    quote:
      'We manage 40+ Apify actors across 12 projects. Before Annalytick, it was chaos. Now everything is organized, tracked, and visible to the whole team.',
  },
  {
    name: 'Maria Santos',
    role: 'Freelance Data Consultant',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-3',
    quote:
      'I use Annalytick for all my client projects. The project-based organization and run history make it easy to show clients exactly what they are getting.',
  },
  {
    name: 'Thomas Wekesa',
    role: 'Solutions Architect',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-3',
    quote: 'Setting up was incredibly fast. We connected our Apify account and had full visibility into our actors within minutes.',
  },
  {
    name: 'Lisa Achieng',
    role: 'Operations Manager',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-4',
    quote:
      'The team collaboration features are exactly what we needed. I can invite analysts, assign them to projects, and everyone sees the same data. No more silos.',
  },
  {
    name: 'Michael Kamau',
    role: 'Backend Engineer',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-4',
    quote: 'The one-click sync for both own and public Apify actors is brilliant. Managing actor configurations has never been easier.',
  },
  {
    name: 'Sophie Wanjiku',
    role: 'Business Intelligence Lead',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-5',
    quote:
      'Annalytick gives us the analytics layer we were missing. Run success rates, cost breakdowns, data volume trends — it is all there in beautiful charts.',
  },
  {
    name: 'Daniel Otieno',
    role: 'Startup Founder',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-5',
    quote: 'As a non-technical founder, Annalytick made web scraping manageable. I can see what is running, what it costs, and what data we are collecting.',
  },
  {
    name: 'Natasha Omondi',
    role: 'Research Lead',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-6',
    quote:
      'We run competitive intelligence scraping across dozens of websites. Annalytick keeps everything organized by project and gives us instant access to historical data.',
  },
  {
    name: 'Carlos Rivera',
    role: 'Agency Director',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-6',
    quote: 'We manage scraping for 8 different clients. Annalytick project separation keeps everything clean and accountable.',
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
            Loved by data teams everywhere
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
