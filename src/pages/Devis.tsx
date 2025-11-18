import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  Plus,
  Search,
  FileText,
  User,
  Car,
  Calendar,
  Euro,
  Edit,
  Copy,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Wrench,
  Package,
  FileEdit,
  Trash2,
  List,
  Grid3x3,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface Devis {
  id: string;
  numero: string;
  date: string;
  clientId: string;
  clientNom: string;
  vehiculeId: string;
  vehiculeImmat: string;
  montantHT: number;
  montantTTC: number;
  tva: number;
  remise: number;
  remiseType: "pourcent" | "montant";
  statut: "brouillon" | "envoyé" | "accepté" | "refusé" | "à relancer";
  lignes: LigneDevis[];
  commentaires?: string;
}

interface LigneDevis {
  id: string;
  type: "prestation" | "piece" | "libre";
  designation: string;
  reference?: string;
  quantite: number;
  temps?: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  totalHT: number;
}

interface Client {
  id: string;
  nom: string;
  type: "particulier" | "pro";
}

interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  clientId: string;
}

interface Prestation {
  id: string;
  designation: string;
  temps: number;
  prixHT: number;
  categorie: string;
}

interface Piece {
  id: string;
  designation: string;
  reference: string;
  prixAchat: number;
  coefficient: number;
  prixVente: number;
}

const Devis = () => {
  const [viewMode, setViewMode] = useState<"liste" | "kanban">("liste");
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [hoveredDevisId, setHoveredDevisId] = useState<string | null>(null);

  // État du formulaire de devis
  const [formClientId, setFormClientId] = useState<string>("");
  const [formVehiculeId, setFormVehiculeId] = useState<string>("");
  const [formLignes, setFormLignes] = useState<LigneDevis[]>([]);
  const [activeLigneTab, setActiveLigneTab] = useState<"prestations" | "pieces">("prestations");
  const [formRemise, setFormRemise] = useState(0);
  const [formRemiseType, setFormRemiseType] = useState<"pourcent" | "montant">("pourcent");
  const [formCommentaires, setFormCommentaires] = useState("");
  const [formStatut, setFormStatut] = useState<Devis["statut"]>("brouillon");

  const clients: Client[] = [
    { id: "1", nom: "Jean Dupont", type: "particulier" },
    { id: "2", nom: "Garage Auto Pro", type: "pro" },
    { id: "3", nom: "Marie Martin", type: "particulier" },
  ];

  const vehicules: Vehicule[] = [
    { id: "1", immatriculation: "AB-123-CD", marque: "Peugeot", modele: "308", clientId: "1" },
    { id: "2", immatriculation: "EF-456-GH", marque: "Renault", modele: "Clio", clientId: "1" },
    { id: "3", immatriculation: "IJ-789-KL", marque: "Citroën", modele: "C3", clientId: "2" },
  ];

  const prestations: Prestation[] = [
    { id: "p1", designation: "Vidange moteur", temps: 0.5, prixHT: 45, categorie: "Entretien" },
    { id: "p2", designation: "Remplacement courroie de distribution", temps: 2, prixHT: 180, categorie: "Réparation" },
    { id: "p3", designation: "Remplacement plaquettes de frein avant", temps: 1, prixHT: 80, categorie: "Freinage" },
    { id: "p4", designation: "Révision complète", temps: 1.5, prixHT: 120, categorie: "Entretien" },
  ];

  const pieces: Piece[] = [
    { id: "pc1", designation: "Filtre à huile", reference: "FIL-123", prixAchat: 8, coefficient: 2.5, prixVente: 20 },
    { id: "pc2", designation: "Courroie distribution", reference: "CRB-456", prixAchat: 45, coefficient: 2, prixVente: 90 },
    { id: "pc3", designation: "Plaquettes frein avant", reference: "PLQ-789", prixAchat: 25, coefficient: 2.5, prixVente: 62.5 },
    { id: "pc4", designation: "Huile moteur 5W30", reference: "HUI-012", prixAchat: 35, coefficient: 1.8, prixVente: 63 },
  ];

  const devis: Devis[] = [
    {
      id: "1",
      numero: "DEV-2024-101",
      date: "2024-01-15",
      clientId: "1",
      clientNom: "Jean Dupont",
      vehiculeId: "1",
      vehiculeImmat: "AB-123-CD",
      montantHT: 2000,
      montantTTC: 2400,
      tva: 400,
      remise: 0,
      remiseType: "pourcent",
      statut: "accepté",
      lignes: [
        {
          id: "l1",
          type: "prestation",
          designation: "Remplacement courroie de distribution",
          quantite: 1,
          temps: 2,
          prixUnitaireHT: 180,
          tauxTVA: 20,
          totalHT: 360,
        },
        {
          id: "l2",
          type: "piece",
          designation: "Courroie distribution",
          reference: "CRB-456",
          quantite: 1,
          prixUnitaireHT: 90,
          tauxTVA: 20,
          totalHT: 90,
        },
      ],
      commentaires: "Garantie 2 ans sur la courroie",
    },
    {
      id: "2",
      numero: "DEV-2024-102",
      date: "2024-01-14",
      clientId: "2",
      clientNom: "Garage Auto Pro",
      vehiculeId: "3",
      vehiculeImmat: "IJ-789-KL",
      montantHT: 850,
      montantTTC: 1020,
      tva: 170,
      remise: 5,
      remiseType: "pourcent",
      statut: "envoyé",
      lignes: [
        {
          id: "l3",
          type: "prestation",
          designation: "Vidange moteur",
          quantite: 1,
          temps: 0.5,
          prixUnitaireHT: 45,
          tauxTVA: 20,
          totalHT: 45,
        },
      ],
    },
    {
      id: "3",
      numero: "DEV-2024-103",
      date: "2024-01-13",
      clientId: "1",
      clientNom: "Jean Dupont",
      vehiculeId: "2",
      vehiculeImmat: "EF-456-GH",
      montantHT: 1500,
      montantTTC: 1800,
      tva: 300,
      remise: 0,
      remiseType: "pourcent",
      statut: "brouillon",
      lignes: [],
    },
    {
      id: "4",
      numero: "DEV-2024-098",
      date: "2024-01-10",
      clientId: "2",
      clientNom: "Garage Auto Pro",
      vehiculeId: "3",
      vehiculeImmat: "IJ-789-KL",
      montantHT: 1200,
      montantTTC: 1440,
      tva: 240,
      remise: 0,
      remiseType: "pourcent",
      statut: "à relancer",
      lignes: [],
    },
    {
      id: "5",
      numero: "DEV-2024-099",
      date: "2024-01-12",
      clientId: "3",
      clientNom: "Marie Martin",
      vehiculeId: "1",
      vehiculeImmat: "AB-123-CD",
      montantHT: 3200,
      montantTTC: 3840,
      tva: 640,
      remise: 0,
      remiseType: "pourcent",
      statut: "envoyé",
      lignes: [],
    },
    {
      id: "6",
      numero: "DEV-2024-100",
      date: "2024-01-11",
      clientId: "1",
      clientNom: "Jean Dupont",
      vehiculeId: "2",
      vehiculeImmat: "EF-456-GH",
      montantHT: 950,
      montantTTC: 1140,
      tva: 190,
      remise: 0,
      remiseType: "pourcent",
      statut: "brouillon",
      lignes: [],
    },
  ];

  const getFilteredDevis = () => {
    let filtered = devis;

    // Filtre par statut
    if (statutFilter !== "all") {
      filtered = filtered.filter((d) => d.statut === statutFilter);
    }

    // Filtre par client
    if (clientFilter !== "all") {
      filtered = filtered.filter((d) => d.clientId === clientFilter);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.numero.toLowerCase().includes(query) ||
          d.clientNom.toLowerCase().includes(query) ||
          d.vehiculeImmat.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredDevis = getFilteredDevis();

  // Grouper les devis par statut pour le Kanban
  const devisByStatut = useMemo(() => {
    const groupes: Record<string, Devis[]> = {
      brouillon: [],
      envoyé: [],
      "à relancer": [],
      accepté: [],
    };

    filteredDevis.forEach((devis) => {
      if (devis.statut === "brouillon") {
        groupes.brouillon.push(devis);
      } else if (devis.statut === "envoyé") {
        groupes.envoyé.push(devis);
      } else if (devis.statut === "à relancer") {
        groupes["à relancer"].push(devis);
      } else if (devis.statut === "accepté") {
        groupes.accepté.push(devis);
      }
    });

    return groupes;
  }, [filteredDevis]);

  // Calculer les totaux par colonne Kanban
  const totauxKanban = useMemo(() => {
    return {
      brouillon: devisByStatut.brouillon.reduce((sum, d) => sum + d.montantTTC, 0),
      envoyé: devisByStatut.envoyé.reduce((sum, d) => sum + d.montantTTC, 0),
      "à relancer": devisByStatut["à relancer"].reduce((sum, d) => sum + d.montantTTC, 0),
      accepté: devisByStatut.accepté.reduce((sum, d) => sum + d.montantTTC, 0),
    };
  }, [devisByStatut]);

  const vehiculesFiltres = formClientId
    ? vehicules.filter((v) => v.clientId === formClientId)
    : vehicules;

  const calculerTotaux = () => {
    const sousTotalPrestations = formLignes
      .filter((l) => l.type === "prestation")
      .reduce((sum, l) => sum + l.totalHT, 0);
    const sousTotalPieces = formLignes
      .filter((l) => l.type === "piece")
      .reduce((sum, l) => sum + l.totalHT, 0);
    const totalHT = sousTotalPrestations + sousTotalPieces;
    const remiseMontant =
      formRemiseType === "pourcent" ? (totalHT * formRemise) / 100 : formRemise;
    const totalHTAvecRemise = totalHT - remiseMontant;
    const tva = totalHTAvecRemise * 0.2;
    const totalTTC = totalHTAvecRemise + tva;

    return {
      sousTotalPrestations,
      sousTotalPieces,
      totalHT,
      remiseMontant,
      totalHTAvecRemise,
      tva,
      totalTTC,
    };
  };

  const totaux = calculerTotaux();

  const handleAjouterPrestation = (prestation: Prestation) => {
    const nouvelleLigne: LigneDevis = {
      id: `ligne-${Date.now()}`,
      type: "prestation",
      designation: prestation.designation,
      quantite: 1,
      temps: prestation.temps,
      prixUnitaireHT: prestation.prixHT,
      tauxTVA: 20,
      totalHT: prestation.prixHT,
    };
    setFormLignes([...formLignes, nouvelleLigne]);
  };

  const handleAjouterPiece = (piece: Piece) => {
    const nouvelleLigne: LigneDevis = {
      id: `ligne-${Date.now()}`,
      type: "piece",
      designation: piece.designation,
      reference: piece.reference,
      quantite: 1,
      prixUnitaireHT: piece.prixVente,
      tauxTVA: 20,
      totalHT: piece.prixVente,
    };
    setFormLignes([...formLignes, nouvelleLigne]);
  };

  const handleAjouterLigneLibre = () => {
    const nouvelleLigne: LigneDevis = {
      id: `ligne-${Date.now()}`,
      type: "libre",
      designation: "",
      quantite: 1,
      prixUnitaireHT: 0,
      tauxTVA: 20,
      totalHT: 0,
    };
    setFormLignes([...formLignes, nouvelleLigne]);
  };

  const handleModifierLigne = (id: string, updates: Partial<LigneDevis>) => {
    setFormLignes(
      formLignes.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...updates };
          updated.totalHT = updated.quantite * updated.prixUnitaireHT;
          return updated;
        }
        return l;
      })
    );
  };

  const handleSupprimerLigne = (id: string) => {
    setFormLignes(formLignes.filter((l) => l.id !== id));
  };

  const handleNouveauDevis = () => {
    setFormClientId("");
    setFormVehiculeId("");
    setFormLignes([]);
    setFormRemise(0);
    setFormRemiseType("pourcent");
    setFormCommentaires("");
    setFormStatut("brouillon");
    setIsCreateSheetOpen(true);
  };

  const handleEditDevis = (devis: Devis) => {
    setSelectedDevis(devis);
    setFormClientId(devis.clientId);
    setFormVehiculeId(devis.vehiculeId);
    setFormLignes([...devis.lignes]);
    setFormRemise(devis.remise);
    setFormRemiseType(devis.remiseType);
    setFormCommentaires(devis.commentaires || "");
    setFormStatut(devis.statut);
    setIsEditSheetOpen(true);
  };

  const handleDupliquerDevis = (devis: Devis) => {
    setFormClientId(devis.clientId);
    setFormVehiculeId(devis.vehiculeId);
    setFormLignes([...devis.lignes]);
    setFormRemise(devis.remise);
    setFormRemiseType(devis.remiseType);
    setFormCommentaires(devis.commentaires || "");
    setFormStatut("brouillon");
    setIsCreateSheetOpen(true);
  };

  const handleTransformerEnFacture = (devisId: string) => {
    console.log("Transformer devis en facture", devisId);
  };

  const handleSauvegarder = () => {
    console.log("Sauvegarder devis", { formClientId, formVehiculeId, formLignes, totaux });
    setIsCreateSheetOpen(false);
    setIsEditSheetOpen(false);
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "brouillon":
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Brouillon</Badge>;
      case "envoyé":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Envoyé</Badge>;
      case "accepté":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Accepté</Badge>;
      case "refusé":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Refusé</Badge>;
      case "à relancer":
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">À relancer</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                GESTION DES DEVIS
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Liste des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Devis
                </span>
              </h1>
              <p className="text-sm text-gray-600">Création, gestion et suivi des devis</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-blue-200/50 rounded-lg p-1">
                <Button
                  variant={viewMode === "liste" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("liste")}
                  className={viewMode === "liste" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-blue-50"}
                >
                  <List className="mr-2 h-4 w-4" />
                  Liste
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className={viewMode === "kanban" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-blue-50"}
                >
                  <Grid3x3 className="mr-2 h-4 w-4" />
                  Kanban
                </Button>
              </div>
              <Button
                onClick={handleNouveauDevis}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Filtres */}
        <BlurFade inView delay={0.05}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher (n° devis, client, véhicule)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="envoyé">Envoyé</SelectItem>
                    <SelectItem value="accepté">Accepté</SelectItem>
                    <SelectItem value="refusé">Refusé</SelectItem>
                    <SelectItem value="à relancer">À relancer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Tous les clients" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Vue Liste */}
        {viewMode === "liste" && (
          <BlurFade inView delay={0.1}>
            <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-200/50 bg-blue-50/50">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Devis</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Client</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Véhicule</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Montant TTC</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Statut</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 w-40">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDevis.map((devis) => (
                        <tr
                          key={devis.id}
                          className="border-b border-blue-100/50 hover:bg-blue-50/50 transition-colors"
                          onMouseEnter={() => setHoveredDevisId(devis.id)}
                          onMouseLeave={() => setHoveredDevisId(null)}
                        >
                          <td className="py-5 px-6">
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="space-y-2">
                                <p className="font-semibold text-base text-gray-900">{devis.numero}</p>
                                <p className="text-sm text-gray-600">{devis.clientNom}</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {devis.montantTTC.toLocaleString()} € TTC
                                </p>
                                <div className="mt-2">{getStatutBadge(devis.statut)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-gray-700">
                            <span className="text-sm">
                              {format(new Date(devis.date), "d MMM yyyy", { locale: fr })}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-gray-700">
                            <span className="text-sm">{devis.clientNom}</span>
                          </td>
                          <td className="py-5 px-6 text-gray-700">
                            <span className="text-sm">{devis.vehiculeImmat}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-sm font-medium text-gray-900">
                              {devis.montantTTC.toLocaleString()} €
                            </span>
                          </td>
                          <td className="py-5 px-6">{getStatutBadge(devis.statut)}</td>
                          <td className="py-5 px-6">
                            <div
                              className={`flex items-center gap-3 transition-opacity ${
                                hoveredDevisId === devis.id ? "opacity-100" : "opacity-0"
                              }`}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditDevis(devis)}
                                className="h-9 w-9 p-0 hover:bg-blue-50"
                                title="Voir"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDupliquerDevis(devis)}
                                className="h-9 w-9 p-0 hover:bg-blue-50"
                                title="Dupliquer"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              {devis.statut === "accepté" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleTransformerEnFacture(devis.id)}
                                  className="h-9 w-9 p-0 hover:bg-green-50"
                                  title="Transformer en facture"
                                >
                                  <Receipt className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredDevis.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-700/60">Aucun devis trouvé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </BlurFade>
        )}

        {/* Vue Kanban */}
        {viewMode === "kanban" && (
          <BlurFade inView delay={0.1}>
            <div className="grid grid-cols-4 gap-4">
              {/* Colonne Brouillons */}
              <div className="flex flex-col">
                <div className="bg-gray-100 p-3 rounded-t-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Brouillons</h3>
                    <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">
                      {devisByStatut.brouillon.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Total: {totauxKanban.brouillon.toLocaleString()} € TTC
                  </p>
                </div>
                <div className="flex-1 bg-gray-50/50 border-x border-b border-gray-200 rounded-b-lg p-3 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                  {devisByStatut.brouillon.map((devis) => (
                    <Card
                      key={devis.id}
                      className="cursor-pointer border border-gray-300 bg-white hover:border-blue-400 hover:shadow-md transition-all"
                      onClick={() => handleEditDevis(devis)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{devis.numero}</p>
                            {getStatutBadge(devis.statut)}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{devis.clientNom}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              <span>{devis.vehiculeImmat}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(devis.date), "d MMM yyyy", { locale: fr })}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-sm font-bold text-gray-900">
                              {devis.montantTTC.toLocaleString()} € TTC
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {devisByStatut.brouillon.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500">Aucun brouillon</div>
                  )}
                </div>
              </div>

              {/* Colonne Envoyés */}
              <div className="flex flex-col">
                <div className="bg-blue-100 p-3 rounded-t-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Envoyés</h3>
                    <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                      {devisByStatut.envoyé.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Total: {totauxKanban.envoyé.toLocaleString()} € TTC
                  </p>
                </div>
                <div className="flex-1 bg-blue-50/50 border-x border-b border-blue-200 rounded-b-lg p-3 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                  {devisByStatut.envoyé.map((devis) => (
                    <Card
                      key={devis.id}
                      className="cursor-pointer border border-blue-300 bg-white hover:border-blue-400 hover:shadow-md transition-all"
                      onClick={() => handleEditDevis(devis)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{devis.numero}</p>
                            {getStatutBadge(devis.statut)}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{devis.clientNom}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              <span>{devis.vehiculeImmat}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(devis.date), "d MMM yyyy", { locale: fr })}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-sm font-bold text-gray-900">
                              {devis.montantTTC.toLocaleString()} € TTC
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {devisByStatut.envoyé.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500">Aucun devis envoyé</div>
                  )}
                </div>
              </div>

              {/* Colonne À relancer */}
              <div className="flex flex-col">
                <div className="bg-orange-100 p-3 rounded-t-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">À relancer</h3>
                    <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                      {devisByStatut["à relancer"].length}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Total: {totauxKanban["à relancer"].toLocaleString()} € TTC
                  </p>
                </div>
                <div className="flex-1 bg-orange-50/50 border-x border-b border-orange-200 rounded-b-lg p-3 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                  {devisByStatut["à relancer"].map((devis) => (
                    <Card
                      key={devis.id}
                      className="cursor-pointer border border-orange-300 bg-white hover:border-orange-400 hover:shadow-md transition-all"
                      onClick={() => handleEditDevis(devis)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{devis.numero}</p>
                            {getStatutBadge(devis.statut)}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{devis.clientNom}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              <span>{devis.vehiculeImmat}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(devis.date), "d MMM yyyy", { locale: fr })}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-sm font-bold text-gray-900">
                              {devis.montantTTC.toLocaleString()} € TTC
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {devisByStatut["à relancer"].length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500">Aucun devis à relancer</div>
                  )}
                </div>
              </div>

              {/* Colonne Acceptés */}
              <div className="flex flex-col">
                <div className="bg-green-100 p-3 rounded-t-lg border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Acceptés</h3>
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                      {devisByStatut.accepté.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Total: {totauxKanban.accepté.toLocaleString()} € TTC
                  </p>
                </div>
                <div className="flex-1 bg-green-50/50 border-x border-b border-green-200 rounded-b-lg p-3 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                  {devisByStatut.accepté.map((devis) => (
                    <Card
                      key={devis.id}
                      className="cursor-pointer border border-green-300 bg-white hover:border-green-400 hover:shadow-md transition-all"
                      onClick={() => handleEditDevis(devis)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{devis.numero}</p>
                            {getStatutBadge(devis.statut)}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{devis.clientNom}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              <span>{devis.vehiculeImmat}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(devis.date), "d MMM yyyy", { locale: fr })}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-sm font-bold text-gray-900">
                              {devis.montantTTC.toLocaleString()} € TTC
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {devisByStatut.accepté.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500">Aucun devis accepté</div>
                  )}
                </div>
              </div>
            </div>
          </BlurFade>
        )}

        {/* Drawer Création/Édition */}
        <Sheet open={isCreateSheetOpen || isEditSheetOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateSheetOpen(false);
            setIsEditSheetOpen(false);
          }
        }}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-white border-blue-200/50 text-gray-900">
            <SheetHeader>
              <SheetTitle className="text-gray-900">
                {isCreateSheetOpen ? "Créer un devis" : "Modifier le devis"}
              </SheetTitle>
              <SheetDescription className="text-gray-700/70">
                {isCreateSheetOpen
                  ? "Créez un nouveau devis pour un client"
                  : "Modifiez les informations du devis"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Bloc Client & Véhicule */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900">Client & Véhicule</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Client</label>
                    <Select value={formClientId} onValueChange={setFormClientId}>
                      <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Véhicule</label>
                    <Select value={formVehiculeId} onValueChange={setFormVehiculeId} disabled={!formClientId}>
                      <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                        <SelectValue placeholder="Sélectionner un véhicule" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        {vehiculesFiltres.map((vehicule) => (
                          <SelectItem key={vehicule.id} value={vehicule.id}>
                            {vehicule.immatriculation} - {vehicule.marque} {vehicule.modele}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Bloc Lignes du devis */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Lignes du devis</h3>
                  <Tabs value={activeLigneTab} onValueChange={(v) => setActiveLigneTab(v as typeof activeLigneTab)}>
                    <TabsList className="bg-white border-blue-300/50">
                      <TabsTrigger value="prestations" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                        <Wrench className="mr-2 h-4 w-4" />
                        Prestations
                      </TabsTrigger>
                      <TabsTrigger value="pieces" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                        <Package className="mr-2 h-4 w-4" />
                        Pièces
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Tabs value={activeLigneTab} onValueChange={(v) => setActiveLigneTab(v as typeof activeLigneTab)}>
                  <TabsContent value="prestations">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {prestations.map((prestation) => (
                        <div
                          key={prestation.id}
                          className="flex items-center justify-between p-2 border border-blue-200/50 rounded hover:bg-blue-50/50 cursor-pointer"
                          onClick={() => handleAjouterPrestation(prestation)}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{prestation.designation}</p>
                            <p className="text-xs text-gray-600">{prestation.prixHT}€ HT • {prestation.temps}h</p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="pieces">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {pieces.map((piece) => (
                        <div
                          key={piece.id}
                          className="flex items-center justify-between p-2 border border-blue-200/50 rounded hover:bg-blue-50/50 cursor-pointer"
                          onClick={() => handleAjouterPiece(piece)}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{piece.designation}</p>
                            <p className="text-xs text-gray-600">{piece.reference} • {piece.prixVente}€ HT</p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Lignes ajoutées */}
                <div className="space-y-2 mt-4">
                  {formLignes.map((ligne) => (
                    <div key={ligne.id} className="flex items-center gap-2 p-2 bg-white border border-blue-200/50 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{ligne.designation}</p>
                        <p className="text-xs text-gray-600">
                          Qté: {ligne.quantite} × {ligne.prixUnitaireHT}€ = {ligne.totalHT}€ HT
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSupprimerLigne(ligne.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleAjouterLigneLibre}
                    className="w-full border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une ligne libre
                  </Button>
                </div>
              </div>

              {/* Bloc Totaux */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900">Récap & Totaux</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Sous-total prestations</span>
                    <span className="font-semibold text-gray-900">{totaux.sousTotalPrestations.toLocaleString()} € HT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Sous-total pièces</span>
                    <span className="font-semibold text-gray-900">{totaux.sousTotalPieces.toLocaleString()} € HT</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-blue-200/50 pt-2">
                    <span className="text-gray-700">Total HT</span>
                    <span className="font-semibold text-gray-900">{totaux.totalHT.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">TVA (20%)</span>
                    <span className="font-semibold text-gray-900">{totaux.tva.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-blue-200/50 pt-2">
                    <span className="text-gray-900">Total TTC</span>
                    <span className="text-gray-900">{totaux.totalTTC.toLocaleString()} €</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Remise</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formRemise}
                      onChange={(e) => setFormRemise(Number(e.target.value))}
                      className="bg-white border-blue-300/50 text-gray-900"
                      placeholder="0"
                    />
                    <Select value={formRemiseType} onValueChange={(v) => setFormRemiseType(v as typeof formRemiseType)}>
                      <SelectTrigger className="w-[120px] bg-white border-blue-300/50 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        <SelectItem value="pourcent">%</SelectItem>
                        <SelectItem value="montant">€</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Bloc Statut */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900">Statut & Envoi</h3>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                  <Select value={formStatut} onValueChange={(v) => setFormStatut(v as Devis["statut"])}>
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value="envoyé">Envoyé</SelectItem>
                      <SelectItem value="accepté">Accepté</SelectItem>
                      <SelectItem value="refusé">Refusé</SelectItem>
                      <SelectItem value="à relancer">À relancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Commentaires</label>
                  <Textarea
                    value={formCommentaires}
                    onChange={(e) => setFormCommentaires(e.target.value)}
                    rows={3}
                    className="bg-white border-blue-300/50 text-gray-900"
                    placeholder="Commentaires ou conditions particulières..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-blue-200/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateSheetOpen(false);
                    setIsEditSheetOpen(false);
                  }}
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSauvegarder}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isCreateSheetOpen ? "Créer" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialog PDF Preview */}
        <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Prévisualisation PDF</DialogTitle>
              <DialogDescription className="text-gray-700/70">Aperçu du devis au format PDF</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-gray-100 rounded-lg min-h-[400px] flex items-center justify-center">
              <p className="text-gray-600">Aperçu PDF du devis</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Devis;
