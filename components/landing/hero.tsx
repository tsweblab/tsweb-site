import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center md:py-32 lg:py-40">
        {/* Badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-2 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Agence Web Nouvelle Génération
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="mb-6 max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
          Transformez votre vision en{" "}
          <span className="gradient-text">réalité digitale</span>
        </h1>

        {/* Subheading */}
        <p className="mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          TS_WEB.lab conçoit des sites web sur mesure qui captent l&apos;attention 
          et convertissent vos visiteurs en clients. Du site vitrine au projet dynamique.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2 glow-primary">
              Lancer mon projet web
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#services">
            <Button size="lg" variant="outline" className="gap-2">
              <Code2 className="h-4 w-4" />
              Découvrir nos offres
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-16">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground md:text-4xl">50+</span>
            <span className="text-sm text-muted-foreground">Projets livrés</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground md:text-4xl">100%</span>
            <span className="text-sm text-muted-foreground">Clients satisfaits</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground md:text-4xl">48h</span>
            <span className="text-sm text-muted-foreground">Réponse rapide</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground md:text-4xl">24/7</span>
            <span className="text-sm text-muted-foreground">Support client</span>
          </div>
        </div>
      </div>
    </section>
  )
}
