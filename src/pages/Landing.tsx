"use client";

import type React from "react";
import { type FC } from "react";
import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { ArrowRight, Bell, Clock, FileText, LayoutDashboard, ListChecks, Zap, BookOpen, Receipt, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-blue-500/[0.15]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-blue-500/[0.15]",
            "shadow-[0_8px_32px_0_rgba(59,130,246,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

const GlowCard: FC<
  React.PropsWithChildren<{
    title: string;
    icon: React.ReactNode;
    description: string;
  }>
> = ({ title, icon, description, children }) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-blue-500/5 p-[1px] shadow-[0_0_40px_rgba(59,130,246,0.2)] border border-blue-500/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.2),_transparent_60%)] opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 h-full rounded-[calc(1.5rem-1px)] bg-white/90 backdrop-blur-sm px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-gray-700">{description}</p>
        {children}
      </div>
    </div>
  );
};

const Landing: FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Rediriger vers le dashboard si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-gray-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-blue-700/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-blue-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-blue-700/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-blue-600/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-blue-400/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-blue-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <header className="relative z-20 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-blue-600/80">Solution de gestion</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-gray-900">LS MECA</span>
            </div>
            <p className="text-xs text-gray-600/70">Solution de gestion pour garages</p>
          </div>

          <div className="flex-1" />
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative flex min-h-[calc(100vh-5rem)] items-center">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16 lg:px-8 lg:py-24">
            <div className="relative mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-white/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-blue-700/80 backdrop-blur-xl">
                <Circle className="h-1.5 w-1.5 fill-blue-500" />
                Solution professionnelle pour garages indépendants
              </div>

              <h1 className="mb-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Moins de paperasse,
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  plus de voitures rendues à l&apos;heure.
                </span>
              </h1>

              <p className="mb-8 mx-auto max-w-xl text-base leading-relaxed text-gray-700 sm:text-lg">
                Un cockpit unique pour créer vos devis, suivre vos clients et transformer plus de demandes en factures, sans perdre de temps sur Excel et le papier.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/login">
                  <ShimmerButton
                    shimmerColor="#dbeafe"
                    background="linear-gradient(135deg, rgba(37,99,235,1), rgba(59,130,246,1))"
                    className="px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white"
                  >
                    Découvrir l&apos;application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </Link>
              </div>

              {/* Bloc chiffres */}
              <div className="mt-12 grid max-w-2xl grid-cols-3 gap-8 text-center mx-auto">
                <div>
                  <p className="mb-2 text-3xl font-semibold text-gray-900">-50%</p>
                  <p className="text-xs leading-relaxed text-gray-600">de temps passé à faire les devis</p>
                </div>
                <div>
                  <p className="mb-2 text-3xl font-semibold text-gray-900">+30%</p>
                  <p className="text-xs leading-relaxed text-gray-600">de devis transformés en factures</p>
                </div>
                <div>
                  <p className="mb-2 text-3xl font-semibold text-gray-900">24/7</p>
                  <p className="text-xs leading-relaxed text-gray-600">historique clients & véhicules centralisé</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Fonctionnalités */}
        <section id="fonctionnalites" className="relative py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                Ce que l&apos;outil fait pour vous
              </h2>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 opacity-40">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                  }}
                />
              </div>

              <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <GlowCard
                  title="Devis ultra rapides"
                  icon={<Zap className="h-5 w-5" />}
                  description="Créez un devis complet en quelques clics avec vos prestations et pièces pré-enregistrées."
                />

                <GlowCard
                  title="Catalogue prêt à l&apos;emploi"
                  icon={<BookOpen className="h-5 w-5" />}
                  description="Standardisez vos prix : prestations types, pièces, temps barémés."
                />

                <GlowCard
                  title="Suivi & relances automatisées"
                  icon={<Bell className="h-5 w-5" />}
                  description="Visualisez immédiatement les devis à envoyer, à relancer, acceptés."
                />

                <GlowCard
                  title="Factures en un clic"
                  icon={<Receipt className="h-5 w-5" />}
                  description="Transformez un devis accepté en facture sans ressaisir les lignes."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section Comment ça marche */}
        <section id="demo" className="relative py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                Comment ça marche ?
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="group relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/20 to-blue-700/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative rounded-3xl border border-blue-200/50 bg-white/90 p-8 backdrop-blur-xl">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl font-bold text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    1
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">Paramétrez votre garage</h3>
                  <p className="text-sm leading-relaxed text-gray-700">
                    Clients, véhicules, prestations, taux horaire.
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/20 to-blue-700/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative rounded-3xl border border-blue-200/50 bg-white/90 p-8 backdrop-blur-xl">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl font-bold text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    2
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">Créez vos devis</h3>
                  <p className="text-sm leading-relaxed text-gray-700">
                    Depuis une fiche véhicule ou un appel client, en 2–3 minutes.
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/20 to-blue-700/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative rounded-3xl border border-blue-200/50 bg-white/90 p-8 backdrop-blur-xl">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl font-bold text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    3
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">Suivez & facturez</h3>
                  <p className="text-sm leading-relaxed text-gray-700">
                    Relances simples, conversion en facture, export PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-gray-200/50 bg-white/80 py-8 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-xs text-gray-600 sm:flex-row lg:px-8">
          <p>
            Prototype conçu avec soin par <span className="font-semibold text-blue-600">Adimi Agency</span>.
          </p>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]">
            <Circle className="h-1 w-1 fill-blue-500" />
            Devis rapides · Factures simplifiées · Garages autonomes
          </p>
        </div>
      </footer>

      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/80 pointer-events-none" />
    </div>
  );
};

export default Landing;

