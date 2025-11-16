import { useState, type FC, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, UserPlus } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";

const Login: FC = () => {
  const navigate = useNavigate();
  const firstName = "Lorenzo";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Ici, on simule un login réussi puis on redirige vers le dashboard.
    // Plus tard, tu pourras brancher ta vraie logique d'authentification
    // et ne naviguer qu'en cas de succès.
    navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Fond en lien avec la landing */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-[-10%] h-80 w-80 rounded-full bg-red-500/25 blur-3xl" />
        <div className="absolute -right-40 bottom-[-10%] h-96 w-96 rounded-full bg-red-700/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_black)]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Carte principale avec arrondi et grosse ombre inspirée de la card d'exemple */}
        <div className="rounded-3xl border border-red-500/25 bg-gradient-to-b from-red-950/80 via-black/90 to-black px-8 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <BlurFade inView>
              <div className="mb-4 flex justify-center">
                <img
                  src="https://media.licdn.com/dms/image/v2/D4D0BAQGWSozeUxWAIA/company-logo_200_200/B4DZbyPbPoGYAI-/0/1747820855073?e=1764806400&v=beta&t=udXEer9_yiMYDEi1x8nhZbawo-CtxsWZFgdoOPWzxfE"
                  alt="Logo Nougarede Peinture"
                  className="h-20 w-20 rounded-full border border-red-200/40 bg-black/60 object-cover shadow-[0_0_35px_rgba(248,113,113,0.45)]"
                />
              </div>
            </BlurFade>
            <BlurFade inView delay={0.05}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-300">
                Espace sécurisé
              </p>
            </BlurFade>
            <BlurFade inView delay={0.1}>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Bienvenue{" "}
                <span className="bg-gradient-to-r from-red-200 via-red-400 to-red-300 bg-clip-text text-transparent">
                  {firstName}
                </span>
                !
              </h1>
            </BlurFade>
            <BlurFade inView delay={0.15}>
              <p className="text-sm text-red-100/80">
                {mode === "login"
                  ? "Connectez-vous pour accéder à votre cockpit de pilotage."
                  : "Créez votre accès pour découvrir le pilotage de vos chantiers."}
              </p>
            </BlurFade>
          </div>

          {/* Tabs connexion / inscription */}
          <div className="mb-8 inline-flex w-full rounded-full bg-white/5 p-1 text-xs font-medium text-red-50/90">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-4 py-2 transition ${
                mode === "login" ? "bg-white text-black shadow-md" : "hover:bg-white/10"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-2 transition ${
                mode === "signup" ? "bg-white text-black shadow-md" : "hover:bg-white/10"
              }`}
            >
              Inscription
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1 text-left">
              <label htmlFor="email" className="text-xs font-medium text-red-100/90">
                Adresse email
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-red-200/70">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-full border border-red-500/70 bg-black/60 pl-10 pr-4 text-sm text-white outline-none ring-red-500/40 transition focus:border-red-400 focus:ring-2"
                  placeholder="prenom.nom@entreprise.fr"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label htmlFor="password" className="text-xs font-medium text-red-100/90">
                Mot de passe
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-red-200/70">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-full border border-red-500/70 bg-black/60 pl-10 pr-10 text-sm text-white outline-none ring-red-500/40 transition focus:border-red-400 focus:ring-2"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-200/80 hover:text-red-100"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-red-100/80">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border border-red-300/60 bg-black/80 text-red-400 focus:ring-red-500"
                />
                <span>Se souvenir de moi</span>
              </label>
              <button type="button" className="text-[11px] font-medium text-red-200 hover:text-red-100">
                Mot de passe oublié ?
              </button>
            </div>

            <div className="pt-3">
              <ShimmerButton
                type="submit"
                shimmerColor="#fee2e2"
                background="linear-gradient(135deg, rgba(248,113,113,1), rgba(220,38,38,1))"
                className="w-full justify-center text-sm font-semibold uppercase tracking-[0.18em]"
              >
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
              </ShimmerButton>
            </div>
          </form>

          <p className="mt-6 text-center text-[11px] text-red-100/70">
            En continuant, vous acceptez nos{" "}
            <button type="button" className="underline underline-offset-2 hover:text-red-50">
              conditions d&apos;utilisation
            </button>
            .
          </p>

          {mode === "login" && (
            <div className="mt-4 text-center text-xs text-red-100/80">
              Vous n&apos;avez pas encore d&apos;accès ?{" "}
              <button
                type="button"
                className="inline-flex items-center gap-1 font-medium text-red-200 hover:text-red-50"
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


