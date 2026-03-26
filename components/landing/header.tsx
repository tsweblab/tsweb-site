"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
              Lancer mon projet web
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 px-6 py-4">
            <Link
              href="#services"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="#about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              À propos
            </Link>
            <Link
              href="#contact"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="w-full">
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="w-full glow-primary">
                  Lancer mon projet web
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
