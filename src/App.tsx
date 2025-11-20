import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Vehicules from "./pages/Vehicules";
import Devis from "./pages/Devis";
import Factures from "./pages/Factures";
import Catalogue from "./pages/Catalogue";
import Clients from "./pages/Clients";
import Relances from "./pages/Relances";
import RapportFinancier from "./pages/RapportFinancier";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicules"
              element={
                <ProtectedRoute>
                  <Vehicules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/devis"
              element={
                <ProtectedRoute>
                  <Devis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/factures"
              element={
                <ProtectedRoute>
                  <Factures />
                </ProtectedRoute>
              }
            />
            <Route
              path="/catalogue"
              element={
                <ProtectedRoute>
                  <Catalogue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relances"
              element={
                <ProtectedRoute>
                  <Relances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rapport-financier"
              element={
                <ProtectedRoute>
                  <RapportFinancier />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
