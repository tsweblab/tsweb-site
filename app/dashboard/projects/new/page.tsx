"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Loader2, AlertCircle, Globe, Rocket, ArrowLeft } from "lucide-react"
import Link from "next/link"

const packOptions = [
  {
    id: "vitrine",
    name: "Pack Vitrine",
    description: "Site vitrine élégant pour présenter votre activité",
    icon: Globe,
    features: ["Design sur mesure", "Jusqu'à 5 pages", "Responsive mobile", "Optimisation SEO"],
  },
  {
    id: "dynamique",
    name: "Pack Dynamique",
    description: "Solution complète avec fonctionnalités avancées",
    icon: Rocket,
    features: ["Pages illimitées", "Espace client", "Base de données", "Tableau de bord admin"],
  },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [packType, setPackType] = useState("vitrine")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [features, setFeatures] = useState("")
  const [references, setReferences] = useState("")
  const [deadline, setDeadline] = useState("")
  const [budget, setBudget] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("Vous devez être connecté pour créer un projet.")
      setIsLoading(false)
      return
    }

    const objectivesText = [
      targetAudience ? `Public cible : ${targetAudience}` : null,
      features ? `Fonctionnalités souhaitées :\n${features}` : null,
    ].filter(Boolean).join("\n\n")

    const { error: insertError } = await supabase.from("projects").insert({
      client_id: user.id,
      project_name: name,
      project_type: packType,
      description,
      objectives: objectivesText || null,
      example_sites: references || null,
      budget_range: budget || null,
      estimated_delivery: deadline || null,
      status: "pending",
    })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push("/dashboard/projects")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Nouveau projet</h1>
          <p className="text-muted-foreground">Décrivez votre projet web en détail.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Pack Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choisissez votre pack</CardTitle>
            <CardDescription>
              Sélectionnez le type de projet qui correspond à vos besoins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={packType} onValueChange={setPackType} className="grid gap-4 md:grid-cols-2">
              {packOptions.map((pack) => (
                <div key={pack.id}>
                  <RadioGroupItem
                    value={pack.id}
                    id={pack.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={pack.id}
                    className="flex cursor-pointer flex-col rounded-lg border-2 border-border p-4 transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <pack.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{pack.name}</p>
                        <p className="text-xs text-muted-foreground">{pack.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {pack.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails du projet</CardTitle>
            <CardDescription>
              Décrivez votre projet pour que nous puissions le réaliser au mieux.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nom du projet *</FieldLabel>
                <Input
                  id="name"
                  placeholder="Ex: Site vitrine de mon restaurant"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description du projet *</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre activité et vos objectifs pour ce site web..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="targetAudience">Public cible</FieldLabel>
                <Textarea
                  id="targetAudience"
                  placeholder="Qui sont vos clients idéaux ? Quelle est leur tranche d'âge, leurs centres d'intérêt ?"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  rows={3}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="features">Fonctionnalités souhaitées</FieldLabel>
                <Textarea
                  id="features"
                  placeholder="Listez les fonctionnalités (une par ligne) :&#10;- Formulaire de contact&#10;- Galerie photos&#10;- Réservation en ligne"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  rows={4}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="references">Sites de référence</FieldLabel>
                <Textarea
                  id="references"
                  placeholder="Partagez des URLs de sites qui vous inspirent (une par ligne) :&#10;https://example.com&#10;https://autre-exemple.com"
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                  rows={3}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="deadline">Deadline souhaitée</FieldLabel>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="budget">Budget estimé</FieldLabel>
                  <Input
                    id="budget"
                    placeholder="Ex: 1500€ - 2000€"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/projects">
            <Button variant="outline" type="button">
              Annuler
            </Button>
          </Link>
          <Button type="submit" className="glow-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer le projet"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
