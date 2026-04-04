"use client"

import Image from "next/image"
import { Code2, Palette, Zap, Users } from "lucide-react"

const values = [
  {
    icon: Code2,
    title: "Excellence technique",
    description: "Technologies modernes et code propre pour des performances optimales.",
  },
  {
    icon: Palette,
    title: "Design innovant",
    description: "Interfaces élégantes qui marquent les esprits et convertissent.",
  },
  {
    icon: Zap,
    title: "Rapidité",
    description: "Développement agile et livraison dans les délais convenus.",
  },
  {
    icon: Users,
    title: "Accompagnement",
    description: "Suivi personnalisé tout au long de votre projet et après.",
  },
]

const founders = [
  {
    name: "Timothée",
    role: "Lead Developer",
    initial: "T",
    photo: "/images/founder-timothee.jpg",
  },
  {
    name: "Sonny",
    role: "Creative Director",
    initial: "S",
    photo: "/images/founder-sonny.jpg",
  },
]

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Text */}
          <div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Qui sommes-<span className="gradient-text">nous</span> ?
            </h2>
            <p className="mb-6 text-pretty text-lg text-muted-foreground">
              TS_WEB.lab est né de la passion commune de deux développeurs pour
              la création web d&apos;excellence. Notre mission : rendre le digital
              accessible et performant pour toutes les entreprises.
            </p>
            <p className="mb-8 text-pretty text-muted-foreground">
              Nous combinons expertise technique et sensibilité design pour créer
              des expériences web uniques. Chaque projet est une nouvelle aventure
              que nous abordons avec enthousiasme et professionnalisme.
            </p>

            {/* Founders */}
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
              {founders.map((founder) => (
                <div key={founder.name} className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-primary/10 sm:h-28 sm:w-28 md:h-32 md:w-32">
                    <Image
                      src={founder.photo}
                      alt={`Photo de ${founder.name}`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 128px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{founder.name}</p>
                    <p className="text-sm text-muted-foreground">{founder.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Values Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <value.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
