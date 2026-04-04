"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Header() {
  const [logoError, setLogoError] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {!logoError ? (
            <Image
              src="/images/logo.png"
              alt="TS WEB Lab"
              width={40}
              height={40}
              className="rounded-lg"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary glow-primary">
              <span className="font-mono text-sm font-bold text-primary-foreground">TS</span>
            </div>
          )}
          <span className="font-mono text-lg font-semibold tracking-tight">
            TS_WEB<span className="text-primary">.lab</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#services" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Services
          </Link>
          <Link href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            À propos
          </Link>
          <Link href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Connexion
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="sm" className="glow-primary">
              Créer un compte
            </Button>
          </Link>
        </div>

        {/* Mobile CTA buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Connexion
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="sm" className="glow-primary">
              Créer un compte
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
