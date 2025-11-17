import { useState } from "react";
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
  Copy,
  X,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
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
  const [statutPaiementFilter, setStatutPaiementFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [creerDepuisDevis, setCreerDepuisDevis] = useState(false);
  const [devisSelectionne, setDevisSelectionne] = useState<Devis | null>(null);

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
  ];

  const vehicules: Vehicule[] = [
    { id: "1", immatriculation: "AB-123-CD", marque: "Peugeot", modele: "308", clientId: "1" },
    { id: "2", immatriculation: "EF-456-GH", marque: "Renault", modele: "Clio", clientId: "1" },
    { id: "3", immatriculation: "IJ-789-KL", marque: "Citroën", modele: "C3", clientId: "2" },
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

  const factures: Facture[] = [
    {
      id: "1",
      numero: "FAC-2024-045",
      date: "2024-01-12",
      dateEcheance: "2024-02-12",
      clientId: "1",
      clientNom: "Jean Dupont",
      vehiculeId: "1",
      vehiculeImmat: "AB-123-CD",
      devisId: "d1",
      montantHT: 2000,
      montantTTC: 2400,
      tva: 400,
      remise: 0,
      statutPaiement: "payée",
      datePaiement: "2024-01-15",
      moyenPaiement: "CB",
      montantPaye: 2400,
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
      numero: "FAC-2024-038",
      date: "2024-01-08",
      dateEcheance: "2024-02-08",
      clientId: "2",
      clientNom: "Garage Auto Pro",
      vehiculeId: "3",
      vehiculeImmat: "IJ-789-KL",
      montantHT: 1900,
      montantTTC: 2280,
      tva: 380,
      remise: 0,
      statutPaiement: "en_attente",
      lignes: [
        {
          id: "l3",
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
      numero: "FAC-2024-032",
      date: "2024-01-05",
      dateEcheance: "2024-02-05",
      clientId: "3",
      clientNom: "Marie Martin",
      vehiculeId: "2",
      vehiculeImmat: "EF-456-GH",
      montantHT: 1500,
      montantTTC: 1800,
      tva: 300,
      remise: 0,
      statutPaiement: "partielle",
      datePaiement: "2024-01-10",
      moyenPaiement: "virement",
      montantPaye: 900,
      lignes: [],
    },
  ];

  const getFilteredFactures = () => {
    let filtered = factures;

    // Filtre par statut paiement
    if (statutPaiementFilter !== "all") {
      filtered = filtered.filter((f) => f.statutPaiement === statutPaiementFilter);
    }

    // Filtre par client
    if (clientFilter !== "all") {
      filtered = filtered.filter((f) => f.clientId === clientFilter);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.numero.toLowerCase().includes(query) ||
          f.clientNom.toLowerCase().includes(query) ||
          f.vehiculeImmat.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredFactures = getFilteredFactures();

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

  const handleNouvelleFacture = () => {
    setCreerDepuisDevis(false);
    setDevisSelectionne(null);
    setFormClientId("");
    setFormVehiculeId("");
    setFormLignes([]);
    setFormRemise(0);
    setFormCommentaires("");
    setFormStatutPaiement("en_attente");
    setFormDatePaiement("");
    setFormMoyenPaiement("");
    setFormMontantPaye(0);
    setIsCreateSheetOpen(true);
  };

  const handleCreerDepuisDevis = (devis: Devis) => {
    setCreerDepuisDevis(true);
    setDevisSelectionne(devis);
    // Pré-remplir depuis le devis
    const client = clients.find((c) => c.nom === devis.clientNom);
    const vehicule = vehicules.find((v) => v.immatriculation === devis.vehiculeImmat);
    if (client) setFormClientId(client.id);
    if (vehicule) setFormVehiculeId(vehicule.id);
    setFormLignes([...devis.lignes]);
    setIsCreateSheetOpen(true);
  };

  const handleNotifierVehiculePret = (facture: Facture) => {
    setSelectedFacture(facture);
    setNotificationMessage(
      `Bonjour,\n\nVotre véhicule ${facture.vehiculeImmat} est prêt à être récupéré.\n\nVous pouvez venir le récupérer aux horaires d'ouverture du garage.\n\nCordialement,`
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
      setNotificationMessage("");
    }
  };

  const handleSauvegarder = () => {
    console.log("Sauvegarder facture", {
      formClientId,
      formVehiculeId,
      formLignes,
      totaux,
      formStatutPaiement,
    });
    setIsCreateSheetOpen(false);
    setIsEditSheetOpen(false);
  };

  const getStatutPaiementBadge = (statut: string) => {
    switch (statut) {
      case "payée":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Payée</Badge>;
      case "en_attente":
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">En attente</Badge>;
      case "partielle":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Partielle</Badge>;
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
                Gestion de la facturation
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Liste des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Factures
                </span>
              </h1>
              <p className="text-sm text-gray-600">Gérer la facturation simple liée aux devis</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleNouvelleFacture}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle facture
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Recherche et filtres */}
        <BlurFade inView delay={0.05}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher (n° facture, client, immatriculation)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                {/* Filtres */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={statutPaiementFilter} onValueChange={setStatutPaiementFilter}>
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue placeholder="Statut paiement" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="payée">Payée</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="partielle">Partielle</SelectItem>
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
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Liste des factures */}
        <BlurFade inView delay={0.1}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Factures</CardTitle>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {filteredFactures.length} facture{filteredFactures.length > 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">N° facture</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Véhicule</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Montant</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut paiement</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFactures.map((facture) => (
                      <tr
                        key={facture.id}
                        className="border-b border-blue-100/50 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">{facture.numero}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {format(new Date(facture.date), "d MMM yyyy", { locale: fr })}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{facture.clientNom}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Car className="h-4 w-4 text-blue-600" />
                            <span>{facture.vehiculeImmat}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {facture.montantTTC.toLocaleString()} €
                        </td>
                        <td className="py-3 px-4">{getStatutPaiementBadge(facture.statutPaiement)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedFacture(facture);
                                setIsPdfDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedFacture(facture);
                                setIsEditSheetOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredFactures.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-700/60">Aucune facture trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Sheet Création/Édition Facture */}
        <Sheet open={isCreateSheetOpen || isEditSheetOpen} onOpenChange={(open) => {
          setIsCreateSheetOpen(open);
          setIsEditSheetOpen(open);
        }}>
          <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white border-blue-200/50 text-gray-900">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900">
                {isEditSheetOpen ? "Modifier la facture" : creerDepuisDevis ? "Créer facture depuis devis" : "Nouvelle facture"}
              </SheetTitle>
              <SheetDescription className="text-gray-700/70">
                {creerDepuisDevis && devisSelectionne && (
                  <span>Devis {devisSelectionne.numero} - Les lignes sont pré-remplies</span>
                )}
                {!creerDepuisDevis && "Créez une nouvelle facture"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Sélection devis si création depuis devis */}
              {!isEditSheetOpen && !creerDepuisDevis && (
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                  <h3 className="font-semibold text-gray-900 mb-3">Créer depuis un devis</h3>
                  <Select
                    value={devisSelectionne?.id || ""}
                    onValueChange={(value) => {
                      const devis = devisDisponibles.find((d) => d.id === value);
                      if (devis) {
                        handleCreerDepuisDevis(devis);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue placeholder="Sélectionner un devis accepté" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                      {devisDisponibles.map((devis) => (
                        <SelectItem key={devis.id} value={devis.id}>
                          {devis.numero} - {devis.clientNom} - {devis.montantTTC.toLocaleString()} € TTC
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
              </div>

              {/* Lignes de facture */}
              {formLignes.length > 0 && (
                <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Lignes de la facture ({formLignes.length})
                  </h3>
                  <div className="space-y-2">
                    {formLignes.map((ligne) => (
                      <div
                        key={ligne.id}
                        className="p-3 border border-blue-200/50 rounded-lg bg-white"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{ligne.designation}</p>
                            {ligne.reference && (
                              <p className="text-xs text-gray-600">Ref: {ligne.reference}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-700">Qté: {ligne.quantite}</span>
                            <span className="text-gray-700">{ligne.prixUnitaireHT.toLocaleString()} € HT</span>
                            <span className="font-semibold text-gray-900 min-w-[100px] text-right">
                              {ligne.totalHT.toLocaleString()} € HT
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloc Récap & Totaux */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Euro className="h-5 w-5 text-blue-600" />
                  Récapitulatif & Totaux
                </h3>
                <div className="space-y-2 bg-white p-4 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Total HT</span>
                    <span className="font-semibold">{totaux.totalHT.toLocaleString()} € HT</span>
                  </div>
                  {totaux.remiseMontant > 0 && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Remise ({formRemise}%)</span>
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

                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={formRemise}
                    onChange={(e) => setFormRemise(Number(e.target.value))}
                    placeholder="Remise %"
                    className="w-32 border-blue-300/50 text-gray-900 text-sm"
                  />
                  <span className="text-sm text-gray-600">% de remise</span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Commentaires
                  </label>
                  <Textarea
                    value={formCommentaires}
                    onChange={(e) => setFormCommentaires(e.target.value)}
                    placeholder="Ajoutez des commentaires..."
                    className="min-h-[80px] bg-white border-blue-300/50 text-gray-900"
                  />
                </div>
              </div>

              {/* Bloc Paiement */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Euro className="h-5 w-5 text-blue-600" />
                  Paiement
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Statut paiement</label>
                    <Select
                      value={formStatutPaiement}
                      onValueChange={(v) => setFormStatutPaiement(v as typeof formStatutPaiement)}
                    >
                      <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="partielle">Partielle</SelectItem>
                        <SelectItem value="payée">Payée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Select
                      value={formMoyenPaiement}
                      onValueChange={(v) => setFormMoyenPaiement(v as typeof formMoyenPaiement)}
                    >
                      <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        <SelectItem value="CB">Carte Bancaire</SelectItem>
                        <SelectItem value="chèque">Chèque</SelectItem>
                        <SelectItem value="virement">Virement</SelectItem>
                        <SelectItem value="espèces">Espèces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formStatutPaiement === "partielle" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Montant payé</label>
                      <Input
                        type="number"
                        value={formMontantPaye}
                        onChange={(e) => setFormMontantPaye(Number(e.target.value))}
                        placeholder="Montant payé"
                        className="bg-white border-blue-300/50 text-gray-900"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSauvegarder}
                  variant="outline"
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
                <Button
                  onClick={handleSauvegarder}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer par mail
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialog Détail Facture avec Notifier */}
        <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900 flex items-center justify-between">
                <span>Facture {selectedFacture?.numero}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (selectedFacture) {
                        handleNotifierVehiculePret(selectedFacture);
                      }
                    }}
                    className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Notifier véhicule prêt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger PDF
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedFacture && (
              <div className="space-y-6">
                {/* En-tête avec logo */}
                <div className="text-center p-6 border-b border-blue-200/50">
                  <h2 className="text-2xl font-bold text-gray-900">SARL LS MECA</h2>
                  <p className="text-sm text-gray-600">Solution de gestion pour garages</p>
                  <p className="text-xs text-gray-500 mt-2">Mentions légales</p>
                </div>

                {/* Détails facture */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Client</h3>
                    <p className="text-sm text-gray-700">{selectedFacture.clientNom}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Véhicule</h3>
                    <p className="text-sm text-gray-700">{selectedFacture.vehiculeImmat}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Date facture</h3>
                    <p className="text-sm text-gray-700">
                      {format(new Date(selectedFacture.date), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  {selectedFacture.dateEcheance && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Date d'échéance</h3>
                      <p className="text-sm text-gray-700">
                        {format(new Date(selectedFacture.dateEcheance), "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Statut paiement */}
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Statut de paiement</p>
                      <div className="flex items-center gap-3">
                        {getStatutPaiementBadge(selectedFacture.statutPaiement)}
                        {selectedFacture.statutPaiement === "partielle" && (
                          <span className="text-sm text-gray-700">
                            {selectedFacture.montantPaye?.toLocaleString()} € / {selectedFacture.montantTTC.toLocaleString()} €
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedFacture.datePaiement && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Date de paiement</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {format(new Date(selectedFacture.datePaiement), "d MMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    )}
                    {selectedFacture.moyenPaiement && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Moyen de paiement</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedFacture.moyenPaiement}</p>
                      </div>
                    )}
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
                      {selectedFacture.lignes.map((ligne) => (
                        <tr key={ligne.id} className="border-b border-blue-100/50">
                          <td className="py-2 px-3 text-gray-900">
                            {ligne.designation}
                            {ligne.reference && (
                              <span className="text-xs text-gray-500 ml-2">({ligne.reference})</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-700">{ligne.quantite}</td>
                          <td className="py-2 px-3 text-right text-gray-700">
                            {ligne.prixUnitaireHT.toLocaleString()} €
                          </td>
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
                    <span className="font-semibold text-gray-900">{selectedFacture.montantHT.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">TVA (20%)</span>
                    <span className="font-semibold text-gray-900">{selectedFacture.tva.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-blue-200/50 pt-2">
                    <span className="text-gray-900">Total TTC</span>
                    <span className="text-gray-900">{selectedFacture.montantTTC.toLocaleString()} €</span>
                  </div>
                </div>

                {selectedFacture.commentaires && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Commentaires</h3>
                    <p className="text-sm text-gray-700">{selectedFacture.commentaires}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Notification */}
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Notifier véhicule prêt</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Envoyez un email au client pour l'informer que son véhicule est prêt
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                <Textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="min-h-[200px] bg-white border-blue-300/50 text-gray-900"
                  placeholder="Votre message..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNotificationDialogOpen(false);
                    setNotificationMessage("");
                  }}
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
      </div>
    </DashboardLayout>
  );
};

export default Factures;

