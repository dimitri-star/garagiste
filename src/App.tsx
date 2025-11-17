import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicules" element={<Vehicules />} />
          <Route path="/devis" element={<Devis />} />
          <Route path="/factures" element={<Factures />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/relances" element={<Relances />} />
          <Route path="/rapport-financier" element={<RapportFinancier />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
