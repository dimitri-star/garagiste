import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Vérifier à la fois user et session pour une sécurité renforcée
  // Si pas de user OU pas de session, rediriger vers login
  if (!user || !session) {
    // Sauvegarder l'URL actuelle pour rediriger après connexion si souhaité
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Utilisateur authentifié, afficher le contenu protégé
  return <>{children}</>;
}

