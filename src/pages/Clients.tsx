import { useState, useMemo } from "react";
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
} from "lucide-react";
import { format, subMonths, isBefore, isAfter, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";

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
  statut: "brouillon" | "envoyé" | "accepté" | "refusé";
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

  const clients: Client[] = [
    {
      id: "1",
      nom: "Jean Dupont",
      type: "particulier",
      telephone: "06 12 34 56 78",
      email: "jean.dupont@email.fr",
      adresse: "123 Rue de la République, 34000 Montpellier",
      nbVehicules: 2,
      nbDevis: 5,
      statut: "actif",
      vehicules: [
        {
          id: "v1",
          marque: "Peugeot",
          modele: "308",
          immatriculation: "AB-123-CD",
          annee: 2019,
        },
        {
          id: "v2",
          marque: "Renault",
          modele: "Clio",
          immatriculation: "EF-456-GH",
          annee: 2021,
        },
      ],
      devis: [
        {
          id: "d1",
          numero: "DEV-2024-101",
          date: "2024-01-15",
          montant: 2500,
          statut: "accepté",
        },
        {
          id: "d2",
          numero: "DEV-2024-087",
          date: "2024-01-10",
          montant: 850,
          statut: "envoyé",
        },
      ],
      factures: [
        {
          id: "f1",
          numero: "FAC-2024-045",
          date: "2024-01-12",
          montant: 2500,
          statut: "payé",
          type: "facture",
        },
        {
          id: "d1",
          numero: "DEV-2024-101",
          date: "2024-01-15",
          montant: 2500,
          statut: "payé",
          type: "devis",
        },
      ],
      caTotal: 5000,
      ca12Mois: 4800,
    },
    {
      id: "2",
      nom: "Garage Auto Pro",
      type: "pro",
      telephone: "04 67 89 01 23",
      email: "contact@garage-auto-pro.fr",
      adresse: "45 Avenue des Fleurs, 34000 Montpellier",
      nbVehicules: 8,
      nbDevis: 12,
      statut: "actif",
      vehicules: [
        {
          id: "v3",
          marque: "Citroën",
          modele: "C3",
          immatriculation: "IJ-789-KL",
          annee: 2020,
        },
      ],
      devis: [
        {
          id: "d3",
          numero: "DEV-2024-092",
          date: "2024-01-09",
          montant: 3100,
          statut: "accepté",
        },
      ],
      factures: [
        {
          id: "f2",
          numero: "FAC-2024-038",
          date: "2024-01-08",
          montant: 3100,
          statut: "à payer",
          type: "facture",
        },
        {
          id: "d3",
          numero: "DEV-2024-092",
          date: "2024-01-09",
          montant: 3100,
          statut: "payé",
          type: "devis",
        },
      ],
      caTotal: 6200,
      ca12Mois: 5900,
    },
    {
      id: "3",
      nom: "Marie Martin",
      type: "particulier",
      telephone: "06 98 76 54 32",
      email: "marie.martin@email.fr",
      adresse: "78 Boulevard du Soleil, 34000 Montpellier",
      nbVehicules: 1,
      nbDevis: 3,
      statut: "actif",
      vehicules: [
        {
          id: "v4",
          marque: "Volkswagen",
          modele: "Golf",
          immatriculation: "MN-012-OP",
          annee: 2018,
        },
      ],
      devis: [
        {
          id: "d4",
          numero: "DEV-2024-098",
          date: "2024-01-12",
          montant: 1900,
          statut: "envoyé",
        },
      ],
      factures: [
        {
          id: "d4",
          numero: "DEV-2024-098",
          date: "2024-01-12",
          montant: 1900,
          statut: "payé",
          type: "devis",
        },
      ],
      caTotal: 1900,
      ca12Mois: 1900,
    },
  ];

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

  const handleArchiver = (clientId: string) => {
    // Logique d'archivage
    console.log("Archiver client", clientId);
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
                  <div className="space-y-2">
                    {filteredClients.map((client) => (
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
                          <div className="flex items-center gap-2">
                            {client.type === "particulier" ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Building2 className="h-4 w-4 text-purple-600" />
                            )}
                            <span className="font-semibold text-sm text-gray-900">
                              {client.nom}
                            </span>
                          </div>
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
                    ))}
                    {filteredClients.length === 0 && (
                      <div className="text-center py-8">
                        <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Aucun client trouvé</p>
                      </div>
                    )}
                  </div>
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
                          onClick={() => setIsEditDialogOpen(true)}
                          className="h-8 px-2 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Créer un nouveau client</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Ajoutez un nouveau client à votre base
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Fonctionnalité en cours de développement...</p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Modifier client */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Modifier le client</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Modifiez les informations du client
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Modification de {selectedClient.nom} - Fonctionnalité en cours de développement...
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => setIsEditDialogOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Clients;

