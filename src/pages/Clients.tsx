import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  Plus,
  Search,
  Phone,
  Mail,
  User,
  Building2,
  Car,
  FileText,
  Edit,
  Archive,
  X,
  PlusCircle,
  Euro,
  TrendingUp,
  Clock,
  CheckCircle2,
  Receipt,
  Trash2,
} from "lucide-react";
import { format, subMonths, isBefore, isAfter, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Client {
  id: string;
  nom: string;
  type: "particulier" | "pro";
  telephone: string;
  email: string;
  adresse?: string;
  nbVehicules: number;
  nbDevis: number;
  statut: "actif" | "archivé";
  vehicules: Vehicule[];
  devis: DevisClient[];
  factures: FactureClient[];
  caTotal?: number; // CA total généré (factures payées + devis acceptés non facturés)
  ca12Mois?: number; // CA des 12 derniers mois
}

interface Vehicule {
  id: string;
  marque: string;
  modele: string;
  immatriculation: string;
  annee?: number;
}

interface DevisClient {
  id: string;
  numero: string;
  date: string;
  montant: number;
  statut: "brouillon" | "généré" | "envoyé" | "accepté" | "refusé";
  pdf_url?: string;
}

interface FactureClient {
  id: string;
  numero: string;
  date: string;
  montant: number;
  statut: "à payer" | "payé" | "en retard";
  type?: "facture" | "devis";
}

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États du formulaire de création/modification
  const [formNom, setFormNom] = useState("");
  const [formType, setFormType] = useState<"particulier" | "pro">("particulier");
  const [formTelephone, setFormTelephone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAdresse, setFormAdresse] = useState("");
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Charger les clients depuis Supabase
  const loadClients = async () => {
    setLoading(true);
    try {
      // Charger les clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('nom');

      if (clientsError) {
        throw clientsError;
      }

      // Pour chaque client, charger les véhicules, devis et factures
      const clientsWithRelations = await Promise.all(
        (clientsData || []).map(async (c: any) => {
          // Charger les véhicules
          const { data: vehiculesData } = await supabase
            .from('vehicules')
            .select('*')
            .eq('client_id', c.id);

          // Charger les devis
          const { data: devisData } = await supabase
            .from('devis')
            .select('id, numero, date, montant_ttc, statut, pdf_url')
            .eq('client_id', c.id)
            .order('date', { ascending: false });

          // Charger les factures (si la table existe)
          let facturesData = null;
          try {
            const { data } = await supabase
              .from('factures')
              .select('id, numero, date, montant_ttc, statut_paiement')
              .eq('client_id', c.id)
              .order('date', { ascending: false });
            facturesData = data;
          } catch (error) {
            // Ignorer si la table n'existe pas
            console.log('Table factures non disponible:', error);
          }

          // Calculer le CA (factures payées + devis acceptés)
          const caTotal = ((facturesData || [])?.filter((f: any) => f.statut_paiement === 'payé')
            .reduce((sum: number, f: any) => sum + Number(f.montant_ttc || 0), 0) || 0) +
            ((devisData || [])?.filter((d: any) => d.statut === 'accepté')
              .reduce((sum: number, d: any) => sum + Number(d.montant_ttc || 0), 0) || 0);

          // CA des 12 derniers mois
          const date12MoisAgo = subMonths(new Date(), 12);
          const ca12Mois = ((facturesData || [])?.filter((f: any) => {
            const dateFacture = new Date(f.date);
            return dateFacture >= date12MoisAgo && f.statut_paiement === 'payé';
          }).reduce((sum: number, f: any) => sum + Number(f.montant_ttc || 0), 0) || 0) +
            ((devisData || [])?.filter((d: any) => {
              const dateDevis = new Date(d.date);
              return dateDevis >= date12MoisAgo && d.statut === 'accepté';
            }).reduce((sum: number, d: any) => sum + Number(d.montant_ttc || 0), 0) || 0);

          return {
            id: c.id,
            nom: c.nom,
            type: c.type as "particulier" | "pro",
            telephone: c.telephone || "",
            email: c.email || "",
            adresse: c.adresse || undefined,
            nbVehicules: vehiculesData?.length || 0,
            nbDevis: devisData?.length || 0,
            statut: c.statut as "actif" | "archivé",
            vehicules: (vehiculesData || []).map((v: any) => ({
              id: v.id,
              marque: v.marque,
              modele: v.modele,
              immatriculation: v.immatriculation,
              annee: v.annee || undefined,
            })),
            devis: (devisData || []).map((d: any) => ({
              id: d.id,
              numero: d.numero,
              date: d.date,
              montant: Number(d.montant_ttc),
              statut: d.statut,
              pdf_url: d.pdf_url || undefined,
            })),
            factures: ((facturesData || []) || []).map((f: any) => ({
              id: f.id,
              numero: f.numero,
              date: f.date,
              montant: Number(f.montant_ttc),
              statut: f.statut_paiement === 'payé' ? 'payé' as const : 
                      f.statut_paiement === 'en_attente' ? 'à payer' as const : 'en retard' as const,
              type: 'facture' as const,
            })),
            caTotal,
            ca12Mois,
          } as Client;
        })
      );

      setClients(clientsWithRelations);
      console.log('Clients chargés:', clientsWithRelations.length);
    } catch (error: any) {
      console.error('Erreur lors du chargement des clients:', error);
      toast.error('Erreur', {
        description: error.message || 'Impossible de charger les clients',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Fonction pour créer un nouveau client
  const handleCreateClient = async () => {
    // Validation
    if (!formNom.trim()) {
      toast.error("Nom requis", {
        description: "Veuillez saisir le nom du client",
      });
      return;
    }

    if (!formTelephone.trim()) {
      toast.error("Téléphone requis", {
        description: "Veuillez saisir le numéro de téléphone",
      });
      return;
    }

    if (!formEmail.trim()) {
      toast.error("Email requis", {
        description: "Veuillez saisir l'email",
      });
      return;
    }

    try {
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert([
          {
            nom: formNom.trim(),
            type: formType,
            telephone: formTelephone.trim(),
            email: formEmail.trim(),
            adresse: formAdresse.trim() || null,
            statut: 'actif',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Client créé", {
        description: `Le client ${formNom} a été créé avec succès`,
      });

      // Réinitialiser le formulaire
      setFormNom("");
      setFormType("particulier");
      setFormTelephone("");
      setFormEmail("");
      setFormAdresse("");

      // Fermer la modal
      setIsCreateDialogOpen(false);

      // Recharger les clients
      await loadClients();
    } catch (error: any) {
      console.error('Erreur lors de la création du client:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible de créer le client",
      });
    }
  };

  // Calcul des segments
  const segments = useMemo(() => {
    const actifs = clients.filter((c) => c.statut === "actif");
    const tous = {
      label: "Tous",
      count: actifs.length,
      montant: actifs.reduce((sum, c) => sum + (c.caTotal || 0), 0),
    };
    const particuliers = actifs.filter((c) => c.type === "particulier");
    const segmentParticuliers = {
      label: "Particuliers",
      count: particuliers.length,
      montant: particuliers.reduce((sum, c) => sum + (c.caTotal || 0), 0),
    };
    const pros = actifs.filter((c) => c.type === "pro");
    const segmentPros = {
      label: "Pros",
      count: pros.length,
      montant: pros.reduce((sum, c) => sum + (c.caTotal || 0), 0),
    };
    const topClients = [...actifs]
      .sort((a, b) => (b.caTotal || 0) - (a.caTotal || 0))
      .slice(0, 3);
    const segmentTop = {
      label: "Top clients",
      count: topClients.length,
      montant: topClients.reduce((sum, c) => sum + (c.caTotal || 0), 0),
    };

    return { tous, particuliers: segmentParticuliers, pros: segmentPros, top: segmentTop };
  }, [clients]);

  // Clients filtrés selon segment sélectionné
  const filteredClients = useMemo(() => {
    let base = clients.filter((c) => c.statut === "actif");

    // Filtre par segment
    if (selectedSegment === "particuliers") {
      base = base.filter((c) => c.type === "particulier");
    } else if (selectedSegment === "pros") {
      base = base.filter((c) => c.type === "pro");
    } else if (selectedSegment === "top") {
      base = [...base].sort((a, b) => (b.caTotal || 0) - (a.caTotal || 0)).slice(0, 3);
    }

    // Filtre par recherche
    if (searchQuery) {
      base = base.filter(
        (c) =>
          c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.telephone.includes(searchQuery) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return base;
  }, [clients, selectedSegment, searchQuery]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleSendDevis = async (devis: DevisClient, client: Client) => {
    if (!devis.pdf_url) {
      toast.error("PDF non disponible", {
        description: "Le devis n'a pas encore été généré.",
      });
      return;
    }

    if (!client.email) {
      toast.error("Email manquant", {
        description: "L'email du client n'est pas renseigné.",
      });
      return;
    }

    try {
      const MAKE_SEND_URL = import.meta.env.VITE_MAKE_SEND_URL || "";
      
      if (!MAKE_SEND_URL) {
        toast.error("Configuration manquante", {
          description: "L'URL d'envoi n'est pas configurée.",
        });
        return;
      }

      // Appeler le webhook d'envoi
      const response = await fetch(MAKE_SEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          devis_id: devis.id,
          email: client.email,
          pdf_url: devis.pdf_url,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mettre à jour le statut dans Supabase
      await supabase
        .from('devis')
        .update({ statut: 'envoyé' })
        .eq('id', devis.id);

      toast.success("Devis envoyé", {
        description: `Le devis a été envoyé à ${client.email}`,
      });

      // Mettre à jour le client localement
      setSelectedClient({
        ...client,
        devis: client.devis.map(d => 
          d.id === devis.id 
            ? { ...d, statut: 'envoyé' as const }
            : d
        ),
      });
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi", {
        description: error.message || "Une erreur est survenue.",
      });
    }
  };

  // Fonction pour ouvrir le formulaire de modification
  const handleEditClient = (client: Client) => {
    setEditingClientId(client.id);
    setFormNom(client.nom);
    setFormType(client.type);
    setFormTelephone(client.telephone);
    setFormEmail(client.email);
    setFormAdresse(client.adresse || "");
    setIsEditDialogOpen(true);
  };

  // Fonction pour modifier un client
  const handleUpdateClient = async () => {
    if (!editingClientId) return;

    // Validation
    if (!formNom.trim()) {
      toast.error("Nom requis", {
        description: "Veuillez saisir le nom du client",
      });
      return;
    }

    if (!formTelephone.trim()) {
      toast.error("Téléphone requis", {
        description: "Veuillez saisir le numéro de téléphone",
      });
      return;
    }

    if (!formEmail.trim()) {
      toast.error("Email requis", {
        description: "Veuillez saisir l'email",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          nom: formNom.trim(),
          type: formType,
          telephone: formTelephone.trim(),
          email: formEmail.trim(),
          adresse: formAdresse.trim() || null,
        })
        .eq('id', editingClientId);

      if (error) {
        throw error;
      }

      toast.success("Client modifié", {
        description: `Le client ${formNom} a été modifié avec succès`,
      });

      // Réinitialiser le formulaire
      setFormNom("");
      setFormType("particulier");
      setFormTelephone("");
      setFormEmail("");
      setFormAdresse("");
      setEditingClientId(null);

      // Fermer la modal
      setIsEditDialogOpen(false);

      // Recharger les clients
      await loadClients();

      // Mettre à jour le client sélectionné si c'est celui qui a été modifié
      if (selectedClient?.id === editingClientId) {
        await loadClients(); // Le client sélectionné sera mis à jour automatiquement
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification du client:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible de modifier le client",
      });
    }
  };

  // Fonction pour supprimer un client
  const handleDeleteClient = async (clientId: string, clientNom: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        throw error;
      }

      // Mettre à jour la liste localement pour un feedback immédiat
      setClients(prev => prev.filter(c => c.id !== clientId));
      
      toast.success("Client supprimé", {
        description: `Le client ${clientNom} a été supprimé`,
      });

      // Si le client supprimé était sélectionné, désélectionner
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }

      // Recharger les clients
      await loadClients();
    } catch (error: any) {
      console.error('Erreur lors de la suppression du client:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible de supprimer le client. Il est peut-être lié à des devis ou véhicules.",
      });
    }
  };

  // Fonction pour archiver un client (changer le statut)
  const handleArchiver = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ statut: 'archivé' })
        .eq('id', clientId);

      if (error) {
        throw error;
      }

      toast.success("Client archivé", {
        description: "Le client a été archivé",
      });

      // Recharger les clients
      await loadClients();
    } catch (error: any) {
      console.error('Erreur lors de l\'archivage du client:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible d'archiver le client",
      });
    }
  };

  const handleCreerDevis = (clientId: string) => {
    // Logique de création de devis
    console.log("Créer devis pour client", clientId);
    // Navigation vers création de devis avec pré-remplissage du client
  };

  const handleAjouterVehicule = (clientId: string) => {
    // Logique d'ajout de véhicule
    console.log("Ajouter véhicule pour client", clientId);
    // Ouvrir un dialog pour ajouter un véhicule
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "accepté":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Accepté</Badge>;
      case "généré":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Généré</Badge>;
      case "envoyé":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Envoyé</Badge>;
      case "brouillon":
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Brouillon</Badge>;
      case "refusé":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Refusé</Badge>;
      case "payé":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Payé</Badge>;
      case "à payer":
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">À payer</Badge>;
      case "en retard":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">En retard</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  // Timeline combinée pour un client
  const getClientTimeline = (client: Client) => {
    const timeline: Array<{
      id: string;
      type: "devis" | "facture" | "notification";
      numero: string;
      date: string;
      montant?: number;
      statut?: string;
      label: string;
    }> = [];

    // Ajouter les devis
    client.devis.forEach((devis) => {
      timeline.push({
        id: devis.id,
        type: "devis",
        numero: devis.numero,
        date: devis.date,
        montant: devis.montant,
        statut: devis.statut,
        label: `Devis ${devis.numero}`,
      });
    });

    // Ajouter les factures
    client.factures.forEach((facture) => {
      timeline.push({
        id: facture.id,
        type: facture.type === "facture" ? "facture" : "devis",
        numero: facture.numero,
        date: facture.date,
        montant: facture.montant,
        statut: facture.statut,
        label: facture.type === "facture" ? `Facture ${facture.numero}` : `Devis ${facture.numero}`,
      });
    });

    // Trier par date (plus récent en premier)
    return timeline.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                BASE CLIENTS CENTRALISÉE
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Liste des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Clients
                </span>
              </h1>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un client
            </Button>
          </div>
        </BlurFade>

        {/* Layout 3 colonnes */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Colonne 1 - Segments */}
          <div className="col-span-3 flex flex-col gap-3">
            <BlurFade inView delay={0.05}>
              <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-gray-700">Segments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Tous */}
                  <button
                    onClick={() => setSelectedSegment("all")}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                      selectedSegment === "all"
                        ? "bg-blue-100 border-blue-400 text-blue-900"
                        : "bg-white border-blue-200/50 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">Tous</span>
                      <Badge className="bg-blue-600 text-white text-xs">
                        {segments.tous.count}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Euro className="h-3 w-3" />
                      <span>{segments.tous.montant.toLocaleString()} €</span>
                    </div>
                  </button>

                  {/* Particuliers */}
                  <button
                    onClick={() => setSelectedSegment("particuliers")}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                      selectedSegment === "particuliers"
                        ? "bg-blue-100 border-blue-400 text-blue-900"
                        : "bg-white border-blue-200/50 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">Particuliers</span>
                      <Badge className="bg-blue-600 text-white text-xs">
                        {segments.particuliers.count}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Euro className="h-3 w-3" />
                      <span>{segments.particuliers.montant.toLocaleString()} €</span>
                    </div>
                  </button>

                  {/* Pros */}
                  <button
                    onClick={() => setSelectedSegment("pros")}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                      selectedSegment === "pros"
                        ? "bg-blue-100 border-blue-400 text-blue-900"
                        : "bg-white border-blue-200/50 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">Pros</span>
                      <Badge className="bg-purple-600 text-white text-xs">
                        {segments.pros.count}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Euro className="h-3 w-3" />
                      <span>{segments.pros.montant.toLocaleString()} €</span>
                    </div>
                  </button>

                  {/* Top clients */}
                  <button
                    onClick={() => setSelectedSegment("top")}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                      selectedSegment === "top"
                        ? "bg-blue-100 border-blue-400 text-blue-900"
                        : "bg-white border-blue-200/50 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Top clients
                      </span>
                      <Badge className="bg-green-600 text-white text-xs">
                        {segments.top.count}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Euro className="h-3 w-3" />
                      <span>{segments.top.montant.toLocaleString()} €</span>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </BlurFade>
          </div>

          {/* Colonne 2 - Liste */}
          <div className="col-span-4 flex flex-col gap-3 min-h-0">
            <BlurFade inView delay={0.1}>
              <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm flex-1 flex flex-col min-h-0">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-gray-900">Liste</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {filteredClients.length} client{filteredClients.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
                        <p className="text-sm text-gray-600">Chargement des clients...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredClients.map((client) => {
                      // Trouver un devis avec PDF mais pas encore envoyé
                      const devisAEnvoyer = client.devis?.find(
                        (d) => d.pdf_url && d.statut !== "envoyé" && d.statut !== "accepté" && d.statut !== "refusé"
                      );

                      return (
                        <div
                          key={client.id}
                          onClick={() => handleSelectClient(client)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedClient?.id === client.id
                              ? "bg-blue-100 border-blue-400"
                              : "bg-white border-blue-200/50 hover:bg-blue-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              {client.type === "particulier" ? (
                                <User className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Building2 className="h-4 w-4 text-purple-600" />
                              )}
                              <span className="font-semibold text-sm text-gray-900">
                                {client.nom}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {devisAEnvoyer && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendDevis(devisAEnvoyer, client);
                                  }}
                                  className="h-7 w-7 p-0 hover:bg-blue-50 text-blue-600"
                                  title="Envoyer le devis par email"
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClient(client);
                                }}
                                className="h-7 w-7 p-0 hover:bg-blue-50 text-blue-600"
                                title="Modifier le client"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClient(client.id, client.nom);
                                }}
                                className="h-7 w-7 p-0 hover:bg-red-50 text-red-600"
                                title="Supprimer le client"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <Badge
                                className={
                                  client.type === "particulier"
                                    ? "bg-blue-100 text-blue-700 border-blue-300 text-xs"
                                    : "bg-purple-100 text-purple-700 border-purple-300 text-xs"
                                }
                              >
                                {client.type === "particulier" ? "Part." : "Pro"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{client.telephone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              <span>{client.nbVehicules}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{client.nbDevis}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                      {filteredClients.length === 0 && (
                        <div className="text-center py-8">
                          <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Aucun client trouvé</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </BlurFade>
          </div>

          {/* Colonne 3 - Fiche client */}
          <div className="col-span-5 flex flex-col gap-3 min-h-0">
            <BlurFade inView delay={0.15}>
              {selectedClient ? (
                <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm flex-1 flex flex-col min-h-0">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                            {selectedClient.type === "particulier" ? (
                              <User className="h-6 w-6 text-blue-600" />
                            ) : (
                              <Building2 className="h-6 w-6 text-purple-600" />
                            )}
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {selectedClient.nom}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            selectedClient.type === "particulier"
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-purple-100 text-purple-700 border-purple-300"
                          }
                        >
                          {selectedClient.type === "particulier" ? "Particulier" : "Pro"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClient(selectedClient)}
                          className="h-8 px-2 hover:bg-blue-50"
                          title="Modifier le client"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClient(selectedClient.id, selectedClient.nom)}
                          className="h-8 px-2 hover:bg-red-50 text-red-600"
                          title="Supprimer le client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-6">
                    {/* Coordonnées */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Coordonnées</h3>
                      <div className="space-y-2 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-900">{selectedClient.telephone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-900">{selectedClient.email}</span>
                        </div>
                        {selectedClient.adresse && (
                          <div className="flex items-start gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                            <span className="text-gray-900">{selectedClient.adresse}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vue 12 derniers mois */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Vue 12 derniers mois
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <Card className="border border-blue-200/50 bg-blue-50/30">
                          <CardContent className="p-3">
                            <div className="text-xs text-gray-600 mb-1">Nb devis</div>
                            <div className="text-lg font-bold text-gray-900">
                              {selectedClient.devis.length}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border border-green-200/50 bg-green-50/30">
                          <CardContent className="p-3">
                            <div className="text-xs text-gray-600 mb-1">Devis acceptés</div>
                            <div className="text-lg font-bold text-gray-900">
                              {selectedClient.devis
                                .filter((d) => d.statut === "accepté")
                                .reduce((sum, d) => sum + d.montant, 0)
                                .toLocaleString()}{" "}
                              €
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border border-purple-200/50 bg-purple-50/30">
                          <CardContent className="p-3">
                            <div className="text-xs text-gray-600 mb-1">CA facturé</div>
                            <div className="text-lg font-bold text-gray-900">
                              {(selectedClient.ca12Mois || 0).toLocaleString()} €
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Devis générés */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Devis générés
                      </h3>
                      <div className="space-y-2">
                        {selectedClient.devis
                          .filter(d => d.pdf_url)
                          .map((devis) => (
                            <div
                              key={devis.id}
                              className="flex items-center justify-between p-3 bg-white border border-blue-200/50 rounded-lg hover:bg-blue-50/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{devis.numero}</p>
                                <p className="text-xs text-gray-600">
                                  {format(parseISO(devis.date), "d MMM yyyy", { locale: fr })} • {devis.montant.toLocaleString()} €
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatutBadge(devis.statut)}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(devis.pdf_url, '_blank')}
                                  className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600"
                                  title="Ouvrir le PDF"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        {selectedClient.devis.filter(d => d.pdf_url).length === 0 && (
                          <p className="text-xs text-gray-500 italic p-3 text-center bg-gray-50 rounded-lg border border-gray-200">
                            Aucun devis généré
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
                      <div className="space-y-2">
                        {getClientTimeline(selectedClient).slice(0, 10).map((item) => (
                          <div
                            key={item.id}
                            className="p-3 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {item.type === "facture" ? (
                                  <Receipt className="h-4 w-4 text-green-600" />
                                ) : (
                                  <FileText className="h-4 w-4 text-blue-600" />
                                )}
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">
                                    {item.label}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {format(new Date(item.date), "d MMM yyyy", { locale: fr })}
                                    {item.montant && ` • ${item.montant.toLocaleString()} €`}
                                  </p>
                                </div>
                              </div>
                              {item.statut && getStatutBadge(item.statut)}
                            </div>
                          </div>
                        ))}
                        {getClientTimeline(selectedClient).length === 0 && (
                          <div className="p-6 text-center bg-blue-50/50 rounded-lg border border-blue-200/50 border-dashed">
                            <Clock className="h-8 w-8 text-blue-600/30 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Aucune activité</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm flex-1 flex items-center justify-center">
                  <CardContent className="text-center">
                    <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">Sélectionnez un client pour voir les détails</p>
                  </CardContent>
                </Card>
              )}
            </BlurFade>
          </div>
        </div>

        {/* Dialog Créer client */}
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            // Réinitialiser le formulaire à la fermeture
            setFormNom("");
            setFormType("particulier");
            setFormTelephone("");
            setFormEmail("");
            setFormAdresse("");
          }
        }}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Créer un nouveau client</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Ajoutez un nouveau client à votre base
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  placeholder="Nom du client"
                  className="bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type <span className="text-red-500">*</span>
                </label>
                <Select value={formType} onValueChange={(value) => setFormType(value as "particulier" | "pro")}>
                  <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="particulier">Particulier</SelectItem>
                    <SelectItem value="pro">Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Téléphone */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formTelephone}
                  onChange={(e) => setFormTelephone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Adresse
                </label>
                <Input
                  value={formAdresse}
                  onChange={(e) => setFormAdresse(e.target.value)}
                  placeholder="123 Rue de la République, 34000 Montpellier"
                  className="bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateClient}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Modifier client */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Réinitialiser le formulaire à la fermeture
            setFormNom("");
            setFormType("particulier");
            setFormTelephone("");
            setFormEmail("");
            setFormAdresse("");
            setEditingClientId(null);
          }
        }}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Modifier le client</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Modifiez les informations du client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  placeholder="Nom du client"
                  className="bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type <span className="text-red-500">*</span>
                </label>
                <Select value={formType} onValueChange={(value) => setFormType(value as "particulier" | "pro")}>
                  <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="particulier">Particulier</SelectItem>
                    <SelectItem value="pro">Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Téléphone */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formTelephone}
                  onChange={(e) => setFormTelephone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Adresse
                </label>
                <Input
                  value={formAdresse}
                  onChange={(e) => setFormAdresse(e.target.value)}
                  placeholder="123 Rue de la République, 34000 Montpellier"
                  className="bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpdateClient}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Clients;

