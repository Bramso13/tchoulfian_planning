"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  HardHat,
  Users,
  CalendarDays,
  BarChart3,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const features = [
    {
      icon: <HardHat className="h-8 w-8" />,
      title: "Gestion de chantiers",
      description:
        "Suivez vos projets de A à Z avec une vision claire de l'avancement, des budgets et des jalons.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gestion d'équipes",
      description:
        "Organisez vos équipes, gérez les compétences et suivez les performances de chaque collaborateur.",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: <CalendarDays className="h-8 w-8" />,
      title: "Planning intelligent",
      description:
        "Optimisez les affectations et évitez les surcharges avec un planning visuel et intuitif.",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Tableaux de bord",
      description:
        "Prenez des décisions éclairées grâce à des indicateurs de performance en temps réel.",
      color: "from-violet-500 to-violet-600",
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Formations",
      description:
        "Planifiez et suivez les formations de vos équipes pour développer leurs compétences.",
      color: "from-rose-500 to-rose-600",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Sécurité & conformité",
      description:
        "Respectez les normes avec une gestion sécurisée des documents et certifications.",
      color: "from-teal-500 to-teal-600",
    },
  ];

  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Gain de temps",
      description:
        "Automatisez vos processus et gagnez des heures chaque semaine",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Meilleure visibilité",
      description: "Ayez une vue d'ensemble en temps réel sur tous vos projets",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Optimisation des ressources",
      description:
        "Répartissez efficacement vos équipes et optimisez les coûts",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Réactivité",
      description: "Réagissez rapidement aux changements et aux imprévus",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold leading-none text-slate-900 dark:text-slate-100">
                TCHOULFIAN
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Planning & Gestion
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#benefits"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Avantages
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Button asChild>
                    <Link href="/protected/dashboard">Tableau de bord</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="ghost">
                      <Link href="/auth/login">Connexion</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/sign-up">Commencer</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
            <Sparkles className="h-4 w-4" />
            <span>La solution de gestion tout-en-un pour vos projets</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-6xl lg:text-7xl">
            Gérez vos chantiers
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              avec simplicité
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400 md:text-xl">
            Une plateforme complète pour organiser vos projets, gérer vos
            équipes et optimiser votre planning. Tout ce dont vous avez besoin,
            au même endroit.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="group gap-2">
              <Link
                href={
                  isAuthenticated ? "/protected/dashboard" : "/auth/sign-up"
                }
              >
                {isAuthenticated
                  ? "Accéder au tableau de bord"
                  : "Commencer gratuitement"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#features">Découvrir les fonctionnalités</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                100%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Visibilité
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                24/7
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Accès
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                ∞
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Projets
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                +50%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Efficacité
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="border-t border-slate-200 bg-white px-6 py-20 dark:border-slate-800 dark:bg-slate-900 md:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
              Toutes les fonctionnalités
              <br />
              <span className="text-slate-600 dark:text-slate-400">
                dont vous avez besoin
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Une solution complète pour gérer efficacement vos projets de
              construction et vos équipes.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:from-slate-900 dark:to-slate-800"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${feature.color} p-3 text-white`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-20 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900 md:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
              Pourquoi choisir
              <br />
              <span className="text-slate-600 dark:text-slate-400">
                TCHOULFIAN Planning ?
              </span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  {benefit.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-20 dark:border-slate-800 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Building2 className="mx-auto mb-6 h-16 w-16 text-white/90" />
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Prêt à transformer
            <br />
            votre gestion de projets ?
          </h2>
          <p className="mb-10 text-lg text-white/90 md:text-xl">
            Rejoignez les équipes qui font confiance à TCHOULFIAN Planning pour
            optimiser leur organisation.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="group gap-2 bg-white text-blue-600 hover:bg-slate-100"
            >
              <Link
                href={
                  isAuthenticated ? "/protected/dashboard" : "/auth/sign-up"
                }
              >
                {isAuthenticated
                  ? "Accéder maintenant"
                  : "Commencer gratuitement"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/auth/login">Déjà un compte ?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <HardHat className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold leading-none text-slate-900 dark:text-slate-100">
                  TCHOULFIAN
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Planning & Gestion
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <Link
                href="#features"
                className="transition hover:text-slate-900 dark:hover:text-slate-100"
              >
                Fonctionnalités
              </Link>
              <Link
                href="#benefits"
                className="transition hover:text-slate-900 dark:hover:text-slate-100"
              >
                Avantages
              </Link>
              <Link
                href="/auth/login"
                className="transition hover:text-slate-900 dark:hover:text-slate-100"
              >
                Connexion
              </Link>
              <Link
                href="/auth/sign-up"
                className="transition hover:text-slate-900 dark:hover:text-slate-100"
              >
                Inscription
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p>
              © {new Date().getFullYear()} TCHOULFIAN Planning. Tous droits
              réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
