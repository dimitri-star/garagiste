import { useState, useEffect, type FC, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, UserPlus, User } from "lucide-react";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";

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
      className={`absolute ${className}`}
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
          className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-blue-500/[0.15] shadow-[0_8px_32px_0_rgba(59,130,246,0.1)] after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]`}
        />
      </motion.div>
    </motion.div>
  );
}

const Login: FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [storedFirstName, setStoredFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Récupérer le prénom stocké au chargement et lors du changement de mode
  useEffect(() => {
    const storedName = localStorage.getItem("userFirstName");
    
    if (storedName) {
      setStoredFirstName(storedName);
    }
  }, [mode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (mode === "signup") {
      // Mode inscription : stocker le prénom et l'email
      if (firstName.trim()) {
        localStorage.setItem("userFirstName", firstName.trim());
        localStorage.setItem("userEmail", email);
        setStoredFirstName(firstName.trim());
      }
    } else {
      // Mode connexion : récupérer le prénom stocké
      const storedName = localStorage.getItem("userFirstName");
      if (storedName) {
        setStoredFirstName(storedName);
      }
    }
    
    // Mode test : permettre la connexion/inscription sans validation réelle
    // Simuler un login réussi puis rediriger vers le dashboard
    navigate("/dashboard");
  };

  // Utiliser le prénom stocké ou celui saisi
  const displayFirstName = storedFirstName || firstName || "";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white text-gray-900">
      {/* Fond en lien avec la landing - couleurs bleues */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-blue-700/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={400}
          height={100}
          rotate={12}
          gradient="from-blue-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={350}
          height={90}
          rotate={-15}
          gradient="from-blue-700/[0.15]"
          className="right-[-5%] md:right-[0%] bottom-[20%] md:bottom-[25%]"
        />

        <ElegantShape
          delay={0.4}
          width={250}
          height={70}
          rotate={-8}
          gradient="from-blue-600/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Carte principale avec arrondi et grosse ombre - design bleu/blanc */}
        <div className="rounded-3xl border border-blue-500/25 bg-white/95 backdrop-blur-2xl px-8 py-10 shadow-[0_40px_120px_rgba(59,130,246,0.15)]">
          <div className="mb-8 text-center">
            <BlurFade inView>
              <div className="mb-4 flex justify-center">
                <img
                  src="https://i.ibb.co/RT60KCss/2021-11-21.png"
                  alt="Logo Sarl LS MECA"
                  className="h-20 w-auto rounded-lg border border-blue-500/40 bg-white object-contain shadow-[0_0_35px_rgba(59,130,246,0.3)] p-2"
                  onError={(e) => {
                    // Si l'image ne charge pas avec .png, essayer d'autres formats
                    const target = e.target as HTMLImageElement;
                    const currentSrc = target.src;
                    if (currentSrc.includes('.png')) {
                      target.src = currentSrc.replace('.png', '.jpg');
                    } else if (currentSrc.includes('.jpg')) {
                      target.src = currentSrc.replace('.jpg', '.jpeg');
                    }
                  }}
                />
              </div>
            </BlurFade>
            <BlurFade inView delay={0.05}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                Espace sécurisé
              </p>
            </BlurFade>
            <BlurFade inView delay={0.1}>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                {displayFirstName ? (
                  <>
                    Bienvenue{" "}
                    <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                      {displayFirstName}
                    </span>
                    !
                  </>
                ) : mode === "signup" ? (
                  "Créer votre compte"
                ) : (
                  "Bienvenue"
                )}
              </h1>
            </BlurFade>
            <BlurFade inView delay={0.15}>
              <p className="text-sm text-gray-600">
                {mode === "login"
                  ? "Connectez-vous pour accéder à votre cockpit de gestion."
                  : "Créez votre accès pour gérer vos devis et factures."}
              </p>
            </BlurFade>
          </div>

          {/* Tabs connexion / inscription */}
          <div className="mb-8 inline-flex w-full rounded-full bg-blue-50 p-1 text-xs font-medium text-gray-700">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-4 py-2 transition ${
                mode === "login" ? "bg-blue-600 text-white shadow-md" : "hover:bg-blue-100"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-2 transition ${
                mode === "signup" ? "bg-blue-600 text-white shadow-md" : "hover:bg-blue-100"
              }`}
            >
              Inscription
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="space-y-1 text-left">
                <label htmlFor="firstName" className="text-xs font-medium text-gray-700">
                  Prénom
                </label>
                <div className="group relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500/70">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 w-full rounded-full border border-blue-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none ring-blue-500/40 transition focus:border-blue-500 focus:ring-2 placeholder:text-gray-400"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 text-left">
              <label htmlFor="email" className="text-xs font-medium text-gray-700">
                Adresse email
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500/70">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-full border border-blue-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none ring-blue-500/40 transition focus:border-blue-500 focus:ring-2 placeholder:text-gray-400"
                  placeholder="prenom.nom@entreprise.fr"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label htmlFor="password" className="text-xs font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500/70">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-full border border-blue-300 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none ring-blue-500/40 transition focus:border-blue-500 focus:ring-2 placeholder:text-gray-400"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500/70 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between pt-1 text-xs text-gray-600">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border border-blue-300 bg-white text-blue-600 focus:ring-blue-500"
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <button type="button" className="text-[11px] font-medium text-blue-600 hover:text-blue-700">
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <div className="pt-3">
              <ShimmerButton
                type="submit"
                shimmerColor="#dbeafe"
                background="linear-gradient(135deg, rgba(37,99,235,1), rgba(59,130,246,1))"
                className="w-full justify-center text-sm font-semibold uppercase tracking-[0.18em] text-white"
              >
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
              </ShimmerButton>
            </div>
          </form>

          <p className="mt-6 text-center text-[11px] text-gray-500">
            En continuant, vous acceptez nos{" "}
            <button type="button" className="underline underline-offset-2 hover:text-blue-600 text-blue-600">
              conditions d&apos;utilisation
            </button>
            .
          </p>

          {mode === "login" && (
            <div className="mt-4 text-center text-xs text-gray-600">
              Vous n&apos;avez pas encore d&apos;accès ?{" "}
              <button
                type="button"
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
                onClick={() => setMode("signup")}
              >
                Créer un compte
                <UserPlus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;


