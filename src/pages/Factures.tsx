import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  FileText,
  User,
  Car,
  Calendar,
  Euro,
  Edit,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Mail,
  Receipt,
  CreditCard,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isBefore, addDays } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface Facture {
  id: string;
  numero: string;
  date: string;
  dateEcheance?: string;
  clientId: string;
  clientNom: string;
  vehiculeId: string;
  vehiculeImmat: string;
  devisId?: string;
  montantHT: number;
  montantTTC: number;
  tva: number;
  remise: number;
  statutPaiement: "payée" | "en_attente" | "partielle";
  datePaiement?: string;
  moyenPaiement?: "CB" | "chèque" | "virement" | "espèces";
  montantPaye?: number;
  lignes: LigneFacture[];
  commentaires?: string;
}

interface LigneFacture {
  id: string;
  type: "prestation" | "piece" | "libre";
  designation: string;
  reference?: string;
  quantite: number;
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

interface Devis {
  id: string;
  numero: string;
  clientNom: string;
  vehiculeImmat: string;
  montantHT: number;
  montantTTC: number;
  lignes: LigneFacture[];
}

const Factures = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [periodeFilter, setPeriodeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("toutes");
  const [showGraphique, setShowGraphique] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // État du formulaire de facture
  const [formClientId, setFormClientId] = useState<string>("");
  const [formVehiculeId, setFormVehiculeId] = useState<string>("");
  const [formLignes, setFormLignes] = useState<LigneFacture[]>([]);
  const [formRemise, setFormRemise] = useState(0);
  const [formCommentaires, setFormCommentaires] = useState("");
  const [formStatutPaiement, setFormStatutPaiement] = useState<Facture["statutPaiement"]>("en_attente");
  const [formDatePaiement, setFormDatePaiement] = useState<string>("");
  const [formMoyenPaiement, setFormMoyenPaiement] = useState<Facture["moyenPaiement"] | "">("");
  const [formMontantPaye, setFormMontantPaye] = useState<number>(0);

  const clients: Client[] = [
    { id: "1", nom: "Jean Dupont", type: "particulier" },
    { id: "2", nom: "Garage Auto Pro", type: "pro" },
    { id: "3", nom: "Marie Martin", type: "particulier" },
    { id: "4", nom: "Pierre Bernard", type: "particulier" },
    { id: "5", nom: "Sophie Leroy", type: "particulier" },
  ];

  const vehicules: Vehicule[] = [
    { id: "1", immatriculation: "AB-123-CD", marque: "Peugeot", modele: "308", clientId: "1" },
    { id: "2", immatriculation: "EF-456-GH", marque: "Renault", modele: "Clio", clientId: "1" },
    { id: "3", immatriculation: "IJ-789-KL", marque: "Citroën", modele: "C3", clientId: "2" },
    { id: "4", immatriculation: "MN-012-OP", marque: "Volkswagen", modele: "Golf", clientId: "3" },
  ];

  const devisDisponibles: Devis[] = [
    {
      id: "d1",
      numero: "DEV-2024-101",
      clientNom: "Jean Dupont",
      vehiculeImmat: "AB-123-CD",
      montantHT: 2000,
      montantTTC: 2400,
      lignes: [
        {
          id: "l1",
          type: "prestation",
          designation: "Remplacement courroie de distribution",
          quantite: 1,
          prixUnitaireHT: 360,
          tauxTVA: 20,
          totalHT: 360,
        },
      ],
    },
  ];

  // Données de factures avec dates variées
  const aujourdhui = new Date();
  const ceMois = format(aujourdhui, "yyyy-MM");
  const moisPrecedent = format(subMonths(aujourdhui, 1), "yyyy-MM");

  const factures: Facture[] = [
    {
      id: "1",
      numero: "FAC-2024-145",
      date: `${ceMois}-25`,
      dateEcheance: format(addDays(new Date(), -5), "yyyy-MM-dd"), // En retard
      clientId: "1",
      clientNom: "Jean Dupont",
      vehiculeId: "1",
      vehiculeImmat: "AB-123-CD",
      montantHT: 2000,
      montantTTC: 2400,
      tva: 400,
      remise: 0,
      statutPaiement: "en_attente",
      lignes: [
        {
          id: "l1",
          type: "prestation",
          designation: "Remplacement courroie de distribution",
          quantite: 1,
          prixUnitaireHT: 360,
          tauxTVA: 20,
          totalHT: 360,
        },
      ],
    },
    {
      id: "2",
      numero: "FAC-2024-146",
      date: `${ceMois}-22`,
      dateEcheance: format(addDays(new Date(), 10), "yyyy-MM-dd"),
      clientId: "2",
      clientNom: "Garage Auto Pro",
      vehiculeId: "3",
      vehiculeImmat: "IJ-789-KL",
      montantHT: 850,
      montantTTC: 1020,
      tva: 170,
      remise: 0,
      statutPaiement: "en_attente",
      lignes: [
        {
          id: "l2",
          type: "prestation",
          designation: "Vidange moteur",
          quantite: 1,
          prixUnitaireHT: 45,
          tauxTVA: 20,
          totalHT: 45,
        },
      ],
    },
    {
      id: "3",
      numero: "FAC-2024-147",
      date: `${ceMois}-20`,
      dateEcheance: format(addDays(new Date(), -10), "yyyy-MM-dd"), // En retard
      clientId: "3",
      clientNom: "Marie Martin",
      vehiculeId: "4",
      vehiculeImmat: "MN-012-OP",
      montantHT: 1500,
      montantTTC: 1800,
      tva: 300,
      remise: 0,
      statutPaiement: "en_attente",
      lignes: [],
    },
    {
      id: "4",
      numero: "FAC-2024-148",
      date: `${ceMois}-18`,
      clientId: "4",
      clientNom: "Pierre Bernard",
      vehiculeId: "1",
      vehiculeImmat: "AB-123-CD",
      montantHT: 3200,
      montantTTC: 3840,
      tva: 640,
      remise: 0,
      statutPaiement: "payée",
      datePaiement: `${ceMois}-19`,
      moyenPaiement: "CB",
      montantPaye: 3840,
      lignes: [],
    },
    {
      id: "5",
      numero: "FAC-2024-149",
      date: `${ceMois}-15`,
      dateEcheance: format(addDays(new Date(), -15), "yyyy-MM-dd"), // En retard
      clientId: "5",
      clientNom: "Sophie Leroy",
      vehiculeId: "2",
      vehiculeImmat: "EF-456-GH",
      montantHT: 1200,
      montantTTC: 1440,
      tva: 240,
      remise: 0,
      statutPaiement: "en_attente",
      lignes: [],
    },
    {
      id: "6",
      numero: "FAC-2024-150",
      date: `${ceMois}-12`,
      clientId: "1",
      clientNom: "Jean Dupont",
      vehiculeId: "2",
      vehiculeImmat: "EF-456-GH",
      montantHT: 950,
      montantTTC: 1140,
      tva: 190,
      remise: 0,
      statutPaiement: "payée",
      datePaiement: `${ceMois}-14`,
      moyenPaiement: "chèque",
      montantPaye: 1140,
      lignes: [],
    },
    {
      id: "7",
      numero: "FAC-2024-138",
      date: `${moisPrecedent}-28`,
      dateEcheance: format(addDays(new Date(), -8), "yyyy-MM-dd"), // En retard
      clientId: "2",
      clientNom: "Garage Auto Pro",
      vehiculeId: "3",
      vehiculeImmat: "IJ-789-KL",
      montantHT: 1900,
      montantTTC: 2280,
      tva: 380,
      remise: 0,
      statutPaiement: "en_attente",
      lignes: [],
    },
    {
      id: "8",
      numero: "FAC-2024-139",
      date: `${moisPrecedent}-25`,
      clientId: "3",
      clientNom: "Marie Martin",
      vehiculeId: "4",
      vehiculeImmat: "MN-012-OP",
      montantHT: 2500,
      montantTTC: 3000,
      tva: 500,
      remise: 0,
      statutPaiement: "payée",
      datePaiement: `${moisPrecedent}-27`,
      moyenPaiement: "virement",
      montantPaye: 3000,
      lignes: [],
    },
  ];

  // Vérifier si une facture est en retard
  const isFactureEnRetard = (facture: Facture) => {
    if (facture.statutPaiement === "payée") return false;
    if (!facture.dateEcheance) return false;
    return isBefore(parseISO(facture.dateEcheance), new Date());
  };

  // Calculer les résumés
  const resumePaiements = useMemo(() => {
    const periodeDates = periodeFilter === "all"
      ? { debut: new Date(0), fin: new Date() }
      : periodeFilter === "ce_mois"
      ? { debut: startOfMonth(aujourdhui), fin: endOfMonth(aujourdhui) }
      : { debut: startOfMonth(subMonths(aujourdhui, 1)), fin: endOfMonth(subMonths(aujourdhui, 1)) };

    let filtered = factures;
    if (clientFilter !== "all") {
      filtered = filtered.filter((f) => f.clientId === clientFilter);
    }

    const facturesPeriode = filtered.filter((f) => {
      const dateFacture = parseISO(f.date);
      return !isBefore(dateFacture, periodeDates.debut) && !isBefore(periodeDates.fin, dateFacture);
    });

    const totalFacture = facturesPeriode.reduce((sum, f) => sum + f.montantTTC, 0);
    const totalPaye = facturesPeriode
      .filter((f) => f.statutPaiement === "payée")
      .reduce((sum, f) => sum + f.montantTTC, 0);
    const totalEnAttente = facturesPeriode
      .filter((f) => f.statutPaiement !== "payée" && !isFactureEnRetard(f))
      .reduce((sum, f) => sum + f.montantTTC, 0);
    const totalEnRetard = facturesPeriode
      .filter((f) => isFactureEnRetard(f))
      .reduce((sum, f) => sum + f.montantTTC, 0);

    return {
      totalFacture,
      totalPaye,
      totalEnAttente,
      totalEnRetard,
    };
  }, [factures, periodeFilter, clientFilter]);

  // Données pour le graphique "Facturé vs Payé" par mois (6 derniers mois)
  const graphiqueData = useMemo(() => {
    const mois = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(aujourdhui, i);
      const moisDebut = startOfMonth(date);
      const moisFin = endOfMonth(date);
      const facturesMois = factures.filter((f) => {
        const dateFacture = parseISO(f.date);
        return !isBefore(dateFacture, moisDebut) && !isBefore(moisFin, dateFacture);
      });
      const factureMois = facturesMois.reduce((sum, f) => sum + f.montantTTC, 0);
      const payeMois = facturesMois
        .filter((f) => f.statutPaiement === "payée")
        .reduce((sum, f) => sum + f.montantTTC, 0);

      mois.push({
        mois: format(date, "MMM yyyy", { locale: fr }),
        facturé: factureMois,
        payé: payeMois,
      });
    }
    return mois;
  }, [factures]);

  // Grouper les factures par statut
  const facturesGroupes = useMemo(() => {
    let filtered = factures;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.numero.toLowerCase().includes(query) ||
          f.clientNom.toLowerCase().includes(query) ||
          f.vehiculeImmat.toLowerCase().includes(query)
      );
    }

    if (clientFilter !== "all") {
      filtered = filtered.filter((f) => f.clientId === clientFilter);
    }

    const groupes = {
      enRetard: filtered.filter((f) => isFactureEnRetard(f)),
      enAttente: filtered.filter((f) => f.statutPaiement !== "payée" && !isFactureEnRetard(f)),
      payees: filtered.filter((f) => f.statutPaiement === "payée"),
    };

    return groupes;
  }, [factures, searchQuery, clientFilter]);

  // Factures filtrées selon l'onglet actif
  const facturesActives = useMemo(() => {
    if (activeTab === "en_retard") {
      return facturesGroupes.enRetard;
    } else if (activeTab === "en_attente") {
      return facturesGroupes.enAttente;
    } else if (activeTab === "payees") {
      return facturesGroupes.payees;
    }
    return [...facturesGroupes.enRetard, ...facturesGroupes.enAttente, ...facturesGroupes.payees];
  }, [facturesGroupes, activeTab]);

  const vehiculesFiltres = formClientId
    ? vehicules.filter((v) => v.clientId === formClientId)
    : vehicules;

  const calculerTotaux = () => {
    const totalHT = formLignes.reduce((sum, l) => sum + l.totalHT, 0);
    const remiseMontant = (totalHT * formRemise) / 100;
    const totalHTAvecRemise = totalHT - remiseMontant;
    const tva = totalHTAvecRemise * 0.2;
    const totalTTC = totalHTAvecRemise + tva;

    return {
      totalHT,
      remiseMontant,
      totalHTAvecRemise,
      tva,
      totalTTC,
    };
  };

  const totaux = calculerTotaux();

  const handleMarquerCommePayee = (factureId: string) => {
    // Logique pour marquer comme payée
    console.log("Marquer facture comme payée", factureId);
  };

  const handleNotifierVehiculePret = (facture: Facture) => {
    setSelectedFacture(facture);
    setNotificationMessage(
      `Bonjour,\n\nVotre véhicule ${facture.vehiculeImmat} est prêt à être récupéré.\n\nCordialement,`
    );
    setIsNotificationDialogOpen(true);
  };

  const handleEnvoyerNotification = () => {
    if (selectedFacture) {
      console.log("Envoyer notification", {
        facture: selectedFacture.numero,
        message: notificationMessage,
      });
      setIsNotificationDialogOpen(false);
      setSelectedFacture(null);
      setNotificationMessage("");
    }
  };

  const getStatutPaiementBadge = (facture: Facture) => {
    const isRetard = isFactureEnRetard(facture);
    switch (facture.statutPaiement) {
      case "payée":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Payée</Badge>;
      case "en_attente":
        return isRetard ? (
          <Badge className="bg-red-500/20 text-red-600 border-red-500/30">En retard</Badge>
        ) : (
          <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">En attente</Badge>
        );
      case "partielle":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Partielle</Badge>;
      default:
        return <Badge variant="secondary">{facture.statutPaiement}</Badge>;
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
                GESTION DE LA FACTURATION
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Liste des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Factures
                </span>
              </h1>
              <p className="text-sm text-gray-600">Gérer la facturation simple liée aux devis</p>
            </div>
            <Button
              onClick={() => setIsCreateSheetOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </div>
        </BlurFade>

        {/* KPIs compacts */}
        <BlurFade inView delay={0.05}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border border-blue-200/50 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Total facturé</p>
                    <p className="text-lg font-bold text-gray-900">
                      {resumePaiements.totalFacture.toLocaleString()} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-green-200/50 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Payé</p>
                    <p className="text-lg font-bold text-green-600">
                      {resumePaiements.totalPaye.toLocaleString()} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-orange-200/50 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600">En attente</p>
                    <p className="text-lg font-bold text-orange-600">
                      {resumePaiements.totalEnAttente.toLocaleString()} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-red-200/50 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-600">En retard</p>
                    <p className="text-lg font-bold text-red-600">
                      {resumePaiements.totalEnRetard.toLocaleString()} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </BlurFade>

        {/* Filtres et Onglets */}
        <BlurFade inView delay={0.1}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardContent className="p-4 space-y-4">
              {/* Filtres */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowGraphique(!showGraphique)}
                  className="border-blue-300/50 bg-white text-gray-700 hover:bg-blue-50"
                >
                  {showGraphique ? "Masquer" : "Afficher"} graphique
                </Button>
              </div>

              {/* Onglets */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border-blue-200/50 w-full grid grid-cols-4">
                  <TabsTrigger value="toutes" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                    Toutes ({facturesGroupes.enRetard.length + facturesGroupes.enAttente.length + facturesGroupes.payees.length})
                  </TabsTrigger>
                  <TabsTrigger value="en_retard" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    En retard ({facturesGroupes.enRetard.length})
                  </TabsTrigger>
                  <TabsTrigger value="en_attente" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                    <Clock className="h-4 w-4 mr-2" />
                    En attente ({facturesGroupes.enAttente.length})
                  </TabsTrigger>
                  <TabsTrigger value="payees" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Payées ({facturesGroupes.payees.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Graphique (optionnel) */}
        {showGraphique && (
          <BlurFade inView delay={0.15}>
            <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Facturé vs Payé par mois</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={graphiqueData}>
                    <XAxis dataKey="mois" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "8px",
                        color: "#1e293b",
                      }}
                      formatter={(value: number) => `€ ${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="facturé" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Facturé" />
                    <Bar dataKey="payé" fill="#22c55e" radius={[8, 8, 0, 0]} name="Payé" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </BlurFade>
        )}

        {/* Table unique avec onglets */}
        <BlurFade inView delay={0.2}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">
                  {activeTab === "en_retard" && (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Factures en retard
                    </span>
                  )}
                  {activeTab === "en_attente" && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      Factures en attente
                    </span>
                  )}
                  {activeTab === "payees" && (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Factures payées
                    </span>
                  )}
                  {activeTab === "toutes" && "Toutes les factures"}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <Badge
                    className={
                      activeTab === "en_retard"
                        ? "bg-red-500/20 text-red-600 border-red-500/30"
                        : activeTab === "en_attente"
                        ? "bg-orange-500/20 text-orange-600 border-orange-500/30"
                        : activeTab === "payees"
                        ? "bg-green-500/20 text-green-600 border-green-500/30"
                        : "bg-blue-500/20 text-blue-600 border-blue-500/30"
                    }
                  >
                    {facturesActives.length}
                  </Badge>
                  <p className="text-sm font-semibold text-gray-900">
                    {facturesActives.reduce((sum, f) => sum + f.montantTTC, 0).toLocaleString()} € TTC
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`border-b ${
                        activeTab === "en_retard"
                          ? "border-red-200/50 bg-red-50/30"
                          : activeTab === "en_attente"
                          ? "border-orange-200/50 bg-orange-50/30"
                          : activeTab === "payees"
                          ? "border-green-200/50 bg-green-50/30"
                          : "border-blue-200/50 bg-blue-50/30"
                      }`}
                    >
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">N° facture</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      {activeTab !== "payees" && (
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Échéance</th>
                      )}
                      {activeTab === "payees" && (
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date paiement</th>
                      )}
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Véhicule</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Montant</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturesActives.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === "payees" ? 7 : 7} className="py-12 text-center text-gray-500">
                          Aucune facture trouvée
                        </td>
                      </tr>
                    ) : (
                      facturesActives.map((facture) => {
                        const isRetard = isFactureEnRetard(facture);
                        return (
                          <tr
                            key={facture.id}
                            className={`border-b ${
                              isRetard
                                ? "border-red-200/30 hover:bg-red-100/30 bg-red-50/20"
                                : activeTab === "en_attente"
                                ? "border-orange-100/50 hover:bg-orange-50/50"
                                : activeTab === "payees"
                                ? "border-green-100/50 hover:bg-green-50/50"
                                : "border-blue-100/50 hover:bg-blue-50/50"
                            } transition-colors`}
                          >
                            <td className="py-4 px-4">
                              <span className="font-semibold text-gray-900">{facture.numero}</span>
                            </td>
                            <td className="py-4 px-4 text-gray-700">
                              {format(parseISO(facture.date), "d MMM yyyy", { locale: fr })}
                            </td>
                            {activeTab !== "payees" && (
                              <td className="py-4 px-4">
                                {isRetard ? (
                                  <span className="text-red-600 font-medium text-xs">
                                    {facture.dateEcheance
                                      ? format(parseISO(facture.dateEcheance), "d MMM yyyy", { locale: fr })
                                      : "-"}
                                  </span>
                                ) : (
                                  <span className="text-gray-700">
                                    {facture.dateEcheance
                                      ? format(parseISO(facture.dateEcheance), "d MMM yyyy", { locale: fr })
                                      : "-"}
                                  </span>
                                )}
                              </td>
                            )}
                            {activeTab === "payees" && (
                              <td className="py-4 px-4 text-gray-700">
                                {facture.datePaiement
                                  ? format(parseISO(facture.datePaiement), "d MMM yyyy", { locale: fr })
                                  : "-"}
                              </td>
                            )}
                            <td className="py-4 px-4 text-gray-700">{facture.clientNom}</td>
                            <td className="py-4 px-4 text-gray-700">{facture.vehiculeImmat}</td>
                            <td className="py-4 px-4">
                              <span className="font-medium text-gray-900">
                                {facture.montantTTC.toLocaleString()} €
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedFacture(facture)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50"
                                  title="Voir"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                {activeTab !== "payees" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarquerCommePayee(facture.id)}
                                    className="h-8 w-8 p-0 hover:bg-green-50"
                                    title="Marquer comme payée"
                                  >
                                    <CreditCard className="h-3.5 w-3.5 text-green-600" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleNotifierVehiculePret(facture)}
                                  className="h-8 w-8 p-0 hover:bg-orange-50"
                                  title="Notifier véhicule prêt"
                                >
                                  <Bell className="h-3.5 w-3.5 text-orange-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Sheet Création/Édition */}
        <Sheet
          open={isCreateSheetOpen || isEditSheetOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateSheetOpen(false);
              setIsEditSheetOpen(false);
            }
          }}
        >
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-white border-blue-200/50 text-gray-900">
            <SheetHeader>
              <SheetTitle className="text-gray-900">
                {isCreateSheetOpen ? "Créer une facture" : "Modifier la facture"}
              </SheetTitle>
              <SheetDescription className="text-gray-700/70">
                {isCreateSheetOpen
                  ? "Créez une nouvelle facture pour un client"
                  : "Modifiez les informations de la facture"}
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

              {/* Bloc Totaux */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900">Récap & Totaux</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
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
              </div>

              {/* Bloc Paiement */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900">Paiement</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Statut paiement</label>
                    <Select
                      value={formStatutPaiement}
                      onValueChange={(v) => setFormStatutPaiement(v as Facture["statutPaiement"])}
                    >
                      <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="payée">Payée</SelectItem>
                        <SelectItem value="partielle">Partielle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formStatutPaiement !== "en_attente" && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Date de paiement</label>
                        <Input
                          type="date"
                          value={formDatePaiement}
                          onChange={(e) => setFormDatePaiement(e.target.value)}
                          className="bg-white border-blue-300/50 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Moyen de paiement</label>
                        <Select value={formMoyenPaiement} onValueChange={(v) => setFormMoyenPaiement(v as Facture["moyenPaiement"])}>
                          <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                            <SelectItem value="CB">Carte bancaire</SelectItem>
                            <SelectItem value="chèque">Chèque</SelectItem>
                            <SelectItem value="virement">Virement</SelectItem>
                            <SelectItem value="espèces">Espèces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
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
                  onClick={() => {
                    console.log("Sauvegarder facture", { formClientId, formVehiculeId, totaux });
                    setIsCreateSheetOpen(false);
                    setIsEditSheetOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isCreateSheetOpen ? "Créer" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialog Notification */}
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Notifier véhicule prêt</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Envoyer un message au client pour l'informer que son véhicule est prêt
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                <Textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={6}
                  className="bg-white border-blue-300/50 text-gray-900"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsNotificationDialogOpen(false)}
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleEnvoyerNotification}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Détail Facture */}
        {selectedFacture && (
          <Dialog open={!!selectedFacture} onOpenChange={() => setSelectedFacture(null)}>
            <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Détail de la facture {selectedFacture.numero}</DialogTitle>
                <DialogDescription className="text-gray-700/70">
                  Informations complètes de la facture
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Client</p>
                    <p className="font-medium text-gray-900">{selectedFacture.clientNom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Véhicule</p>
                    <p className="font-medium text-gray-900">{selectedFacture.vehiculeImmat}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-medium text-gray-900">
                      {format(parseISO(selectedFacture.date), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  {selectedFacture.dateEcheance && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Échéance</p>
                      <p className="font-medium text-gray-900">
                        {format(parseISO(selectedFacture.dateEcheance), "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-blue-200/50">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-900">Total TTC</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedFacture.montantTTC.toLocaleString()} €
                    </p>
                  </div>
                  {getStatutPaiementBadge(selectedFacture)}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Factures;
