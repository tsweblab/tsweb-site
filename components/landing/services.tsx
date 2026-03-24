import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Globe, Rocket, ArrowRight } from "lucide-react"

const services = [
  {
    name: "Pack Vitrine",
    description: "Site vitrine élégant pour présenter votre activité",
    icon: Globe,
    features: [
      "Design sur mesure",
      "Jusqu'à 5 pages",
      "Responsive mobile",
      "Optimisation SEO de base",
      "Formulaire de contact",
      "Hébergement 1 an inclus",
    ],
    price: "À partir de 990€",
    popular: false,
  },
  {
    name: "Pack Dynamique",
    description: "Solution complète avec fonctionnalités avancées",
    icon: Rocket,
    features: [
      "Tout le Pack Vitrine +",
      "Pages illimitées",
      "Espace client personnalisé",
      "Base de données",
      "Système de réservation/paiement",
      "Tableau de bord admin",
      "Support prioritaire",
      "Maintenance 1 an incluse",
    ],
    price: "Sur devis",
    popular: true,
  },
]

export function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Nos <span className="gradient-text">Offres</span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Deux packs adaptés à vos besoins, de la simple présentation web 
            aux applications dynamiques les plus complexes.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {services.map((service) => (
            <Card
              key={service.name}
              className={`relative flex flex-col overflow-hidden transition-all hover:border-primary/50 ${
                service.popular ? "border-primary glow-primary" : ""
              }`}
            >
              {service.popular && (
                <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Populaire
                </div>
              )}
              
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{service.name}</CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-8 flex-1 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-4">
                  <p className="text-2xl font-bold text-foreground">{service.price}</p>
                  <Link href="/auth/sign-up" className="block">
                    <Button
                      className={`w-full gap-2 ${service.popular ? "glow-primary" : ""}`}
                      variant={service.popular ? "default" : "outline"}
                    >
                      Choisir ce pack
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Besoin d&apos;une solution personnalisée ?{" "}
          <Link href="#contact" className="text-primary hover:underline">
            Contactez-nous
          </Link>{" "}
          pour un devis gratuit.
        </p>
      </div>
    </section>
  )
}
