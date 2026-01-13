import { useState, useEffect, type FC, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, UserPlus, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";
import { toast } from "sonner";

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
  const { signUp, signIn, user, signInAsGuest } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Rediriger si déjà connecté (ne vérifier que quand le loading est terminé)
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const { error, session } = await signUp(email, password, firstName);
        
        if (error) {
          setError(error.message || "Une erreur est survenue lors de l'inscription");
          toast.error("Erreur lors de l'inscription", {
            description: error.message,
          });
        } else if (session) {
          // Si une session est créée (email confirmation désactivée), connecter directement
          toast.success("Inscription réussie", {
            description: "Connexion en cours...",
          });
          navigate("/dashboard", { replace: true });
        } else {
          toast.success("Inscription réussie", {
            description: "Vous pouvez maintenant vous connecter.",
          });
          // Rediriger vers la page de connexion après l'inscription
          setMode("login");
          setEmail(email); // Garder l'email rempli
          setFirstName(""); // Vider le prénom
          setPassword(""); // Vider le mot de passe
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          setError(error.message || "Email ou mot de passe incorrect");
          toast.error("Erreur de connexion", {
            description: error.message,
          });
        } else {
          toast.success("Connexion réussie", {
            description: "Redirection en cours...",
          });
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur inattendue est survenue";
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

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
                {mode === "signup" ? (
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

          {/* Message d'erreur */}
          {error && (
            <BlurFade inView>
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </BlurFade>
          )}

          {/* Tabs connexion / inscription */}
          <div className="mb-8 inline-flex w-full rounded-full bg-blue-50 p-1 text-xs font-medium text-gray-700">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 rounded-full px-4 py-2 transition ${
                mode === "login" ? "bg-blue-600 text-white shadow-md" : "hover:bg-blue-100"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
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
                    disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500/70 hover:text-blue-600"
                  disabled={loading}
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
                    disabled={loading}
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <button type="button" className="text-[11px] font-medium text-blue-600 hover:text-blue-700" disabled={loading}>
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <div className="pt-3">
              <ShimmerButton
                type="submit"
                shimmerColor="#dbeafe"
                background="linear-gradient(135deg, rgba(37,99,235,1), rgba(59,130,246,1))"
                className="w-full justify-center text-sm font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading
                  ? "Traitement en cours..."
                  : mode === "login"
                  ? "Se connecter"
                  : "Créer mon compte"}
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
                disabled={loading}
              >
                Créer un compte
                <UserPlus className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Bouton d'accès direct */}
          <div className="mt-6 pt-6 border-t border-blue-200/50">
            <button
              type="button"
              onClick={() => {
                signInAsGuest();
                toast.success("Accès direct activé", {
                  description: "Vous accédez à l'application en mode démo.",
                });
                navigate("/dashboard", { replace: true });
              }}
              disabled={loading}
              className="w-full rounded-full border-2 border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 text-sm font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-100/70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                Accéder directement à l&apos;application
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <p className="mt-2 text-center text-[10px] text-gray-500">
              Mode démo - Accès sans authentification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


