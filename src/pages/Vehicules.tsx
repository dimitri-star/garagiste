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
  Car,
  User,
  FileText,
  Mail,
  Edit,
  Calendar,
  Gauge,
  Wrench,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Link } from "react-router-dom";

interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  clientId: string;
  clientNom: string;
  nbDevis: number;
  nbInterventions: number;
  infosTechniques: {
    energie?: string;
    puissance?: string;
    couleur?: string;
    dateAchat?: string;
  };
  notesTechniques: NoteTechnique[];
  devis: DevisVehicule[];
  factures: FactureVehicule[];
  notifications: Notification[];
}

interface NoteTechnique {
  id: string;
  date: string;
  texte: string;
  auteur: string;
}

interface DevisVehicule {
  id: string;
  numero: string;
  date: string;
  montant: number;
  statut: "brouillon" | "envoyé" | "accepté" | "refusé";
}

interface FactureVehicule {
  id: string;
  numero: string;
  date: string;
  montant: number;
  statut: "à payer" | "payé" | "en retard";
}

interface Notification {
  id: string;
  date: string;
  type: "véhicule_prêt" | "document_manquant";
  statut: "envoyé" | "lu" | "erreur";
  message: string;
}

const Vehicules = () => {
  const [searchImmatriculation, setSearchImmatriculation] = useState("");
  const [marqueFilter, setMarqueFilter] = useState<string>("all");
  const [modeleFilter, setModeleFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<"véhicule_prêt" | "document_manquant" | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");

  const vehicules: Vehicule[] = [
    {
      id: "1",
      immatriculation: "AB-123-CD",
      marque: "Peugeot",
      modele: "308",
      annee: 2019,
      kilometrage: 85000,
      clientId: "1",
      clientNom: "Jean Dupont",
      nbDevis: 3,
      nbInterventions: 5,
      infosTechniques: {
        energie: "Diesel",
        puissance: "120 CV",
        couleur: "Bleu",
        dateAchat: "2019-03-15",
      },
      notesTechniques: [
        {
          id: "n1",
          date: "2024-01-10",
          texte: "Courroie de distribution changée à 120 000 km",
          auteur: "Mécanicien",
        },
        {
          id: "n2",
          date: "2024-01-05",
          texte: "Vidange effectuée, filtre à huile remplacé",
          auteur: "Mécanicien",
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
        },
      ],
      notifications: [
        {
          id: "not1",
          date: "2024-01-12",
          type: "véhicule_prêt",
          statut: "envoyé",
          message: "Votre véhicule est prêt à être récupéré.",
        },
      ],
    },
    {
      id: "2",
      immatriculation: "EF-456-GH",
      marque: "Renault",
      modele: "Clio",
      annee: 2021,
      kilometrage: 35000,
      clientId: "1",
      clientNom: "Jean Dupont",
      nbDevis: 2,
      nbInterventions: 2,
      infosTechniques: {
        energie: "Essence",
        puissance: "90 CV",
        couleur: "Blanc",
        dateAchat: "2021-06-20",
      },
      notesTechniques: [],
      devis: [
        {
          id: "d3",
          numero: "DEV-2024-092",
          date: "2024-01-09",
          montant: 3100,
          statut: "accepté",
        },
      ],
      factures: [],
      notifications: [],
    },
    {
      id: "3",
      immatriculation: "IJ-789-KL",
      marque: "Citroën",
      modele: "C3",
      annee: 2020,
      kilometrage: 65000,
      clientId: "2",
      clientNom: "Garage Auto Pro",
      nbDevis: 4,
      nbInterventions: 6,
      infosTechniques: {
        energie: "Diesel",
        puissance: "100 CV",
        couleur: "Gris",
        dateAchat: "2020-09-10",
      },
      notesTechniques: [
        {
          id: "n3",
          date: "2024-01-08",
          texte: "Pneus avant usés, recommandation de changement",
          auteur: "Mécanicien",
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
          id: "f2",
          numero: "FAC-2024-038",
          date: "2024-01-08",
          montant: 1900,
          statut: "à payer",
        },
      ],
      notifications: [],
    },
  ];

  const marques = Array.from(new Set(vehicules.map((v) => v.marque)));
  const modeles = Array.from(new Set(vehicules.map((v) => v.modele)));
  const clients = Array.from(new Set(vehicules.map((v) => v.clientNom)));

  const filteredVehicules = vehicules.filter((vehicule) => {
    const matchesImmatriculation =
      searchImmatriculation === "" ||
      vehicule.immatriculation.toLowerCase().includes(searchImmatriculation.toLowerCase());
    const matchesMarque = marqueFilter === "all" || vehicule.marque === marqueFilter;
    const matchesModele = modeleFilter === "all" || vehicule.modele === modeleFilter;
    const matchesClient = clientFilter === "all" || vehicule.clientNom === clientFilter;

    return matchesImmatriculation && matchesMarque && matchesModele && matchesClient;
  });

  const handleOpenVehicule = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
    setIsDialogOpen(true);
  };

  const handleNotifierVehiculePret = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
    setNotificationType("véhicule_prêt");
    setNotificationMessage(
      `Bonjour,\n\nVotre véhicule ${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation}) est prêt à être récupéré.\n\nVous pouvez venir le récupérer aux horaires d'ouverture du garage.\n\nCordialement,`
    );
    setIsNotificationDialogOpen(true);
  };

  const handleDemanderDocument = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
    setNotificationType("document_manquant");
    setNotificationMessage(
      `Bonjour,\n\nPour finaliser le dossier de votre véhicule ${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation}), nous aurions besoin du document suivant :\n\n- [Précisez le document : carte grise, RIB, etc.]\n\nMerci de bien vouloir nous le transmettre.\n\nCordialement,`
    );
    setIsNotificationDialogOpen(true);
  };

  const handleEnvoyerNotification = () => {
    if (selectedVehicule && notificationType) {
      // Logique d'envoi de notification
      console.log("Envoyer notification", {
        vehicule: selectedVehicule.immatriculation,
        type: notificationType,
        message: notificationMessage,
      });
      setIsNotificationDialogOpen(false);
      setNotificationMessage("");
      setNotificationType(null);
    }
  };

  const handleCreerDevis = (vehiculeId: string) => {
    // Logique de création de devis
    console.log("Créer devis pour véhicule", vehiculeId);
    // Navigation vers création de devis avec pré-remplissage du véhicule
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
      case "lu":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Lu</Badge>;
      case "erreur":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Erreur</Badge>;
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
                Historique des véhicules
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Gestion des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Véhicules
                </span>
              </h1>
              <p className="text-sm text-gray-600">
                Retrouvez tout l'historique d'un véhicule par immatriculation
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un véhicule
            </Button>
          </div>
        </BlurFade>

        {/* Recherche et filtres */}
        <BlurFade inView delay={0.05}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par immatriculation..."
                    value={searchImmatriculation}
                    onChange={(e) => setSearchImmatriculation(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={marqueFilter} onValueChange={setMarqueFilter}>
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue placeholder="Marque" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                      <SelectItem value="all">Toutes les marques</SelectItem>
                      {marques.map((marque) => (
                        <SelectItem key={marque} value={marque}>
                          {marque}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={modeleFilter} onValueChange={setModeleFilter}>
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue placeholder="Modèle" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                      <SelectItem value="all">Tous les modèles</SelectItem>
                      {modeles.map((modele) => (
                        <SelectItem key={modele} value={modele}>
                          {modele}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                      <SelectItem value="all">Tous les clients</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client} value={client}>
                          {client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Liste des véhicules */}
        <BlurFade inView delay={0.1}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Véhicules</CardTitle>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {filteredVehicules.length} véhicule{filteredVehicules.length > 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Immatriculation</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Marque</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Modèle</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Année</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kilométrage</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Devis / Interventions</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicules.map((vehicule) => (
                      <tr
                        key={vehicule.id}
                        className="border-b border-blue-100/50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => handleOpenVehicule(vehicule)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">{vehicule.immatriculation}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{vehicule.marque}</td>
                        <td className="py-3 px-4 text-gray-700">{vehicule.modele}</td>
                        <td className="py-3 px-4 text-gray-700">{vehicule.annee}</td>
                        <td className="py-3 px-4 text-gray-700">{vehicule.clientNom}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Gauge className="h-4 w-4 text-blue-600" />
                            <span>{vehicule.kilometrage.toLocaleString()} km</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span>{vehicule.nbDevis}</span>
                            <span className="text-gray-400">/</span>
                            <Wrench className="h-4 w-4 text-blue-600" />
                            <span>{vehicule.nbInterventions}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVehicule(vehicule);
                              setIsEditDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredVehicules.length === 0 && (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-700/60">Aucun véhicule trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Dialog Fiche véhicule */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-blue-200/50 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Car className="h-6 w-6 text-blue-600" />
                {selectedVehicule?.marque} {selectedVehicule?.modele} - {selectedVehicule?.immatriculation}
              </DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Fiche complète du véhicule
              </DialogDescription>
            </DialogHeader>

            {selectedVehicule && (
              <div className="space-y-6">
                {/* Infos techniques */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    Informations techniques
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                    <div>
                      <p className="text-xs text-blue-600/60 mb-1">Immatriculation</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedVehicule.immatriculation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600/60 mb-1">Marque / Modèle</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedVehicule.marque} {selectedVehicule.modele}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600/60 mb-1">Année</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedVehicule.annee}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600/60 mb-1">Kilométrage</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Gauge className="h-4 w-4 text-blue-600" />
                        {selectedVehicule.kilometrage.toLocaleString()} km
                      </p>
                    </div>
                    {selectedVehicule.infosTechniques.energie && (
                      <div>
                        <p className="text-xs text-blue-600/60 mb-1">Énergie</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedVehicule.infosTechniques.energie}
                        </p>
                      </div>
                    )}
                    {selectedVehicule.infosTechniques.puissance && (
                      <div>
                        <p className="text-xs text-blue-600/60 mb-1">Puissance</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedVehicule.infosTechniques.puissance}
                        </p>
                      </div>
                    )}
                    {selectedVehicule.infosTechniques.couleur && (
                      <div>
                        <p className="text-xs text-blue-600/60 mb-1">Couleur</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedVehicule.infosTechniques.couleur}
                        </p>
                      </div>
                    )}
                    {selectedVehicule.infosTechniques.dateAchat && (
                      <div>
                        <p className="text-xs text-blue-600/60 mb-1">Date d'achat</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {format(new Date(selectedVehicule.infosTechniques.dateAchat), "d MMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client associé */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Client associé
                  </h3>
                  <div className="p-4 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{selectedVehicule.clientNom}</p>
                          <p className="text-sm text-gray-600">Client ID: {selectedVehicule.clientId}</p>
                        </div>
                      </div>
                      <Link to={`/clients`}>
                        <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-700 hover:bg-blue-50">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Voir la fiche client
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Historique des devis */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Historique des devis ({selectedVehicule.devis.length})
                  </h3>
                  {selectedVehicule.devis.length === 0 ? (
                    <div className="p-6 text-center bg-blue-50/50 rounded-lg border border-blue-200/50 border-dashed">
                      <FileText className="h-8 w-8 text-blue-600/30 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucun devis</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedVehicule.devis.map((devis) => (
                        <div
                          key={devis.id}
                          className="p-3 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{devis.numero}</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(devis.date), "d MMM yyyy", { locale: fr })} •{" "}
                                {devis.montant.toLocaleString()} €
                              </p>
                            </div>
                            {getStatutBadge(devis.statut)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Historique des factures */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Historique des factures ({selectedVehicule.factures.length})
                  </h3>
                  {selectedVehicule.factures.length === 0 ? (
                    <div className="p-6 text-center bg-blue-50/50 rounded-lg border border-blue-200/50 border-dashed">
                      <FileText className="h-8 w-8 text-blue-600/30 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucune facture</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedVehicule.factures.map((facture) => (
                        <div
                          key={facture.id}
                          className="p-3 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{facture.numero}</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(facture.date), "d MMM yyyy", { locale: fr })} •{" "}
                                {facture.montant.toLocaleString()} €
                              </p>
                            </div>
                            {getStatutBadge(facture.statut)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes techniques */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Notes techniques ({selectedVehicule.notesTechniques.length})
                  </h3>
                  {selectedVehicule.notesTechniques.length === 0 ? (
                    <div className="p-6 text-center bg-blue-50/50 rounded-lg border border-blue-200/50 border-dashed">
                      <Wrench className="h-8 w-8 text-blue-600/30 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucune note technique</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedVehicule.notesTechniques.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{note.texte}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(note.date), "d MMM yyyy", { locale: fr })}</span>
                                <span>•</span>
                                <span>{note.auteur}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bloc Communication client */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Communication client
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleNotifierVehiculePret(selectedVehicule)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Notifier véhicule prêt
                      </Button>
                      <Button
                        onClick={() => handleDemanderDocument(selectedVehicule)}
                        variant="outline"
                        className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Demander un document
                      </Button>
                      <Button
                        onClick={() => handleCreerDevis(selectedVehicule.id)}
                        variant="outline"
                        className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Créer un devis
                      </Button>
                    </div>

                    {/* Historique des notifications */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Historique des notifications ({selectedVehicule.notifications.length})
                      </h4>
                      {selectedVehicule.notifications.length === 0 ? (
                        <p className="text-sm text-gray-500">Aucune notification envoyée</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedVehicule.notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="p-3 border border-blue-200/50 rounded-lg bg-white text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {notif.type === "véhicule_prêt" ? "Véhicule prêt" : "Document manquant"}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {format(new Date(notif.date), "d MMM yyyy à HH:mm", { locale: fr })}
                                  </p>
                                </div>
                                {getStatutBadge(notif.statut)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Notification */}
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {notificationType === "véhicule_prêt" ? "Notifier véhicule prêt" : "Demander un document"}
              </DialogTitle>
              <DialogDescription className="text-gray-700/70">
                {notificationType === "véhicule_prêt"
                  ? "Envoyez un email au client pour l'informer que son véhicule est prêt"
                  : "Envoyez un email au client pour demander un document manquant"}
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
                    setNotificationType(null);
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

        {/* Dialog Créer véhicule */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Créer un nouveau véhicule</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Ajoutez un nouveau véhicule à votre base
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

        {/* Dialog Modifier véhicule */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Modifier le véhicule</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Modifiez les informations du véhicule
              </DialogDescription>
            </DialogHeader>
            {selectedVehicule && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Modification de {selectedVehicule.immatriculation} - Fonctionnalité en cours de développement...
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

export default Vehicules;

