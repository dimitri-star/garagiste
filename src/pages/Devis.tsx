import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle,
  Eye,
  Download,
  Wrench,
  Package,
  FileEdit,
  Trash2,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [activeViewTab, setActiveViewTab] = useState<"tous" | "brouillons" | "en_attente" | "à_relancer" | "acceptés">("tous");
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

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
  ];

  const getFilteredDevis = () => {
    let filtered = devis;

    // Filtre par vue rapide
    if (activeViewTab === "brouillons") {
      filtered = filtered.filter((d) => d.statut === "brouillon");
    } else if (activeViewTab === "en_attente") {
      filtered = filtered.filter((d) => d.statut === "envoyé");
    } else if (activeViewTab === "à_relancer") {
      filtered = filtered.filter((d) => d.statut === "à relancer");
    } else if (activeViewTab === "acceptés") {
      filtered = filtered.filter((d) => d.statut === "accepté");
    }

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

  const handleSauvegarder = () => {
    // Logique de sauvegarde
    console.log("Sauvegarder devis", { formClientId, formVehiculeId, formLignes, totaux });
    setIsCreateSheetOpen(false);
    setIsEditSheetOpen(false);
  };

  const handleTransformerEnFacture = (devisId: string) => {
    // Logique de transformation en facture
    console.log("Transformer devis en facture", devisId);
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
                Gestion des devis
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Liste des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Devis
                </span>
              </h1>
              <p className="text-sm text-gray-600">Création, gestion et suivi des devis</p>
            </div>
            <Button
              onClick={handleNouveauDevis}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau devis
            </Button>
          </div>
        </BlurFade>

        {/* Filtres et onglets */}
        <BlurFade inView delay={0.05}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher (n° devis, client, immatriculation)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                {/* Filtres */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={statutFilter} onValueChange={setStatutFilter}>
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue placeholder="Statut" />
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
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue placeholder="Client" />
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
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                      <SelectItem value="all">Toutes les périodes</SelectItem>
                      <SelectItem value="mois">Ce mois</SelectItem>
                      <SelectItem value="semaine">Cette semaine</SelectItem>
                      <SelectItem value="trimestre">Ce trimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Onglets vues rapides */}
                <Tabs value={activeViewTab} onValueChange={(v) => setActiveViewTab(v as typeof activeViewTab)}>
                  <TabsList className="bg-white border-blue-200/50">
                    <TabsTrigger value="tous" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                      Tous
                    </TabsTrigger>
                    <TabsTrigger value="brouillons" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                      Brouillons
                    </TabsTrigger>
                    <TabsTrigger value="en_attente" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                      En attente
                    </TabsTrigger>
                    <TabsTrigger value="à_relancer" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                      À relancer
                    </TabsTrigger>
                    <TabsTrigger value="acceptés" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                      Acceptés
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Liste des devis */}
        <BlurFade inView delay={0.1}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Devis</CardTitle>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {filteredDevis.length} devis{filteredDevis.length > 1 ? "" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">N° devis</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Véhicule</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Montant TTC</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevis.map((devis) => (
                      <tr
                        key={devis.id}
                        className="border-b border-blue-100/50 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">{devis.numero}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {format(new Date(devis.date), "d MMM yyyy", { locale: fr })}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{devis.clientNom}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Car className="h-4 w-4 text-blue-600" />
                            <span>{devis.vehiculeImmat}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {devis.montantTTC.toLocaleString()} €
                        </td>
                        <td className="py-3 px-4">{getStatutBadge(devis.statut)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedDevis(devis);
                                setIsPdfDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDupliquerDevis(devis)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {devis.statut === "accepté" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTransformerEnFacture(devis.id)}
                                className="h-8 px-2 hover:bg-green-50 text-green-700"
                              >
                                <FileText className="mr-1 h-4 w-4" />
                                Facture
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

        {/* Sheet Création/Édition Devis */}
        <Sheet open={isCreateSheetOpen || isEditSheetOpen} onOpenChange={(open) => {
          setIsCreateSheetOpen(open);
          setIsEditSheetOpen(open);
        }}>
          <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white border-blue-200/50 text-gray-900">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900">
                {isEditSheetOpen ? "Modifier le devis" : "Nouveau devis"}
              </SheetTitle>
              <SheetDescription className="text-gray-700/70">
                Créez ou modifiez un devis avec prestations et pièces
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Bloc Client & Véhicule */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Client & Véhicule
                </h3>
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
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer nouveau client
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer nouveau véhicule
                  </Button>
                </div>
              </div>

              {/* Bloc Lignes du devis */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Lignes du devis
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAjouterLigneLibre}
                    className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ligne libre
                  </Button>
                </div>

                <Tabs value={activeLigneTab} onValueChange={(v) => setActiveLigneTab(v as typeof activeLigneTab)}>
                  <TabsList className="bg-white border-blue-200/50">
                    <TabsTrigger value="prestations" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                      <Wrench className="mr-2 h-4 w-4" />
                      Prestations
                    </TabsTrigger>
                    <TabsTrigger value="pieces" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                      <Package className="mr-2 h-4 w-4" />
                      Pièces
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="prestations" className="mt-4">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {prestations.map((prestation) => (
                        <div
                          key={prestation.id}
                          className="p-3 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors cursor-pointer"
                          onClick={() => handleAjouterPrestation(prestation)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{prestation.designation}</p>
                              <p className="text-xs text-gray-600">
                                {prestation.temps}h • {prestation.prixHT}€ HT
                              </p>
                            </div>
                            <Plus className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="pieces" className="mt-4">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {pieces.map((piece) => (
                        <div
                          key={piece.id}
                          className="p-3 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors cursor-pointer"
                          onClick={() => handleAjouterPiece(piece)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{piece.designation}</p>
                              <p className="text-xs text-gray-600">
                                Ref: {piece.reference} • {piece.prixVente}€ HT (Coef: {piece.coefficient}x)
                              </p>
                            </div>
                            <Plus className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Liste des lignes ajoutées */}
                {formLignes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formLignes.map((ligne) => (
                      <div
                        key={ligne.id}
                        className="p-3 border border-blue-200/50 rounded-lg bg-white"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 grid grid-cols-4 gap-2">
                            <Input
                              value={ligne.designation}
                              onChange={(e) => handleModifierLigne(ligne.id, { designation: e.target.value })}
                              placeholder="Désignation"
                              className="border-blue-300/50 text-gray-900 text-sm"
                            />
                            {ligne.type === "piece" && (
                              <Input
                                value={ligne.reference || ""}
                                onChange={(e) => handleModifierLigne(ligne.id, { reference: e.target.value })}
                                placeholder="Référence"
                                className="border-blue-300/50 text-gray-900 text-sm"
                              />
                            )}
                            <Input
                              type="number"
                              value={ligne.quantite}
                              onChange={(e) => handleModifierLigne(ligne.id, { quantite: Number(e.target.value) })}
                              placeholder="Qté"
                              className="border-blue-300/50 text-gray-900 text-sm"
                            />
                            <Input
                              type="number"
                              value={ligne.prixUnitaireHT}
                              onChange={(e) =>
                                handleModifierLigne(ligne.id, { prixUnitaireHT: Number(e.target.value) })
                              }
                              placeholder="Prix unitaire HT"
                              className="border-blue-300/50 text-gray-900 text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 min-w-[80px] text-right">
                              {ligne.totalHT.toLocaleString()} € HT
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSupprimerLigne(ligne.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bloc Récap & Totaux */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Euro className="h-5 w-5 text-blue-600" />
                  Récapitulatif & Totaux
                </h3>
                <div className="space-y-2 bg-white p-4 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Sous-total main d'œuvre</span>
                    <span className="font-semibold">{totaux.sousTotalPrestations.toLocaleString()} € HT</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Sous-total pièces</span>
                    <span className="font-semibold">{totaux.sousTotalPieces.toLocaleString()} € HT</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Total HT</span>
                    <span className="font-semibold">{totaux.totalHT.toLocaleString()} € HT</span>
                  </div>
                  <div className="flex gap-2 items-center border-t border-blue-200/50 pt-2">
                    <Input
                      type="number"
                      value={formRemise}
                      onChange={(e) => setFormRemise(Number(e.target.value))}
                      placeholder="Remise"
                      className="w-32 border-blue-300/50 text-gray-900 text-sm"
                    />
                    <Select value={formRemiseType} onValueChange={(v) => setFormRemiseType(v as typeof formRemiseType)}>
                      <SelectTrigger className="w-32 bg-white border-blue-300/50 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        <SelectItem value="pourcent">%</SelectItem>
                        <SelectItem value="montant">€</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {totaux.remiseMontant > 0 && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Remise</span>
                      <span className="font-semibold text-green-600">
                        -{totaux.remiseMontant.toLocaleString()} €
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Total HT (après remise)</span>
                    <span className="font-semibold">{totaux.totalHTAvecRemise.toLocaleString()} € HT</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>TVA (20%)</span>
                    <span className="font-semibold">{totaux.tva.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-blue-200/50 pt-2">
                    <span>Total TTC</span>
                    <span>{totaux.totalTTC.toLocaleString()} € TTC</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Commentaires / Conditions particulières
                  </label>
                  <Textarea
                    value={formCommentaires}
                    onChange={(e) => setFormCommentaires(e.target.value)}
                    placeholder="Ajoutez des commentaires ou conditions particulières..."
                    className="min-h-[100px] bg-white border-blue-300/50 text-gray-900"
                  />
                </div>
              </div>

              {/* Bloc Statut & Envoi */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Statut & Envoi
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                  <Select value={formStatut} onValueChange={(v) => setFormStatut(v as typeof formStatut)}>
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
                <div className="flex gap-3">
                  <Button
                    onClick={handleSauvegarder}
                    variant="outline"
                    className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Enregistrer brouillon
                  </Button>
                  <Button
                    onClick={() => {
                      setFormStatut("envoyé");
                      handleSauvegarder();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer au client
                  </Button>
                  <Button
                    onClick={() => {
                      setFormStatut("accepté");
                      handleSauvegarder();
                    }}
                    variant="outline"
                    className="border-green-500/30 bg-white text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marquer comme accepté
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialog Prévisualisation PDF */}
        <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900 flex items-center justify-between">
                <span>Prévisualisation PDF - {selectedDevis?.numero}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger PDF
                </Button>
              </DialogTitle>
            </DialogHeader>
            {selectedDevis && (
              <div className="space-y-6">
                {/* En-tête avec logo */}
                <div className="text-center p-6 border-b border-blue-200/50">
                  <h2 className="text-2xl font-bold text-gray-900">SARL LS MECA</h2>
                  <p className="text-sm text-gray-600">Solution de gestion pour garages</p>
                  <p className="text-xs text-gray-500 mt-2">Mentions légales</p>
                </div>

                {/* Détails devis */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Client</h3>
                    <p className="text-sm text-gray-700">{selectedDevis.clientNom}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Véhicule</h3>
                    <p className="text-sm text-gray-700">{selectedDevis.vehiculeImmat}</p>
                  </div>
                </div>

                {/* Lignes */}
                <div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-blue-200/50">
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Désignation</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Qté</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">P.U. HT</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Total HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDevis.lignes.map((ligne) => (
                        <tr key={ligne.id} className="border-b border-blue-100/50">
                          <td className="py-2 px-3 text-gray-900">{ligne.designation}</td>
                          <td className="py-2 px-3 text-right text-gray-700">{ligne.quantite}</td>
                          <td className="py-2 px-3 text-right text-gray-700">{ligne.prixUnitaireHT.toLocaleString()} €</td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900">
                            {ligne.totalHT.toLocaleString()} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totaux */}
                <div className="space-y-2 bg-blue-50/50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Total HT</span>
                    <span className="font-semibold text-gray-900">{selectedDevis.montantHT.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">TVA (20%)</span>
                    <span className="font-semibold text-gray-900">{selectedDevis.tva.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-blue-200/50 pt-2">
                    <span className="text-gray-900">Total TTC</span>
                    <span className="text-gray-900">{selectedDevis.montantTTC.toLocaleString()} €</span>
                  </div>
                </div>

                {selectedDevis.commentaires && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Commentaires</h3>
                    <p className="text-sm text-gray-700">{selectedDevis.commentaires}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Devis;

