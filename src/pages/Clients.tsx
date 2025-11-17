import { useState } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
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
}

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        },
      ],
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
        },
      ],
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
      factures: [],
    },
  ];

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchQuery === "" ||
      client.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.telephone.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || client.type === typeFilter;
    const isActive = client.statut === "actif";

    return matchesSearch && matchesType && isActive;
  });

  const handleOpenClient = (client: Client) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleArchiver = (clientId: string) => {
    // Logique d'archivage
    console.log("Archiver client", clientId);
    setIsDialogOpen(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                Base clients centralisée
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Liste des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Clients
                </span>
              </h1>
              <p className="text-sm text-gray-600">
                Gérez vos clients, leurs véhicules et leurs devis
              </p>
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

        {/* Recherche et filtres */}
        <BlurFade inView delay={0.05}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher (nom, téléphone, email)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Type de client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="particulier">Particulier</SelectItem>
                    <SelectItem value="pro">Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Table des clients */}
        <BlurFade inView delay={0.1}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Clients</CardTitle>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {filteredClients.length} client{filteredClients.length > 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Téléphone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Véhicules</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Devis</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-blue-100/50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => handleOpenClient(client)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {client.type === "particulier" ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Building2 className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="font-medium text-gray-900">{client.nom}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              client.type === "particulier"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : "bg-purple-100 text-purple-700 border-purple-300"
                            }
                          >
                            {client.type === "particulier" ? "Particulier" : "Pro"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{client.telephone}</td>
                        <td className="py-3 px-4 text-gray-700">{client.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Car className="h-4 w-4 text-blue-600" />
                            <span>{client.nbVehicules}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-700">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span>{client.nbDevis}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClient(client);
                                setIsEditDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchiver(client.id);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Archive className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-700/60">Aucun client trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Dialog Fiche client */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-blue-200/50 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {selectedClient?.type === "particulier" ? (
                  <User className="h-6 w-6 text-blue-600" />
                ) : (
                  <Building2 className="h-6 w-6 text-blue-600" />
                )}
                {selectedClient?.nom}
              </DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Fiche complète du client
              </DialogDescription>
            </DialogHeader>

            {selectedClient && (
              <div className="space-y-6">
                {/* Infos client */}
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                  <div>
                    <p className="text-xs text-blue-600/60 mb-1">Type</p>
                    <Badge
                      className={
                        selectedClient.type === "particulier"
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-purple-100 text-purple-700 border-purple-300"
                      }
                    >
                      {selectedClient.type === "particulier" ? "Particulier" : "Professionnel"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600/60 mb-1">Téléphone</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      {selectedClient.telephone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600/60 mb-1">Email</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      {selectedClient.email}
                    </p>
                  </div>
                  {selectedClient.adresse && (
                    <div>
                      <p className="text-xs text-blue-600/60 mb-1">Adresse</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedClient.adresse}</p>
                    </div>
                  )}
                </div>

                {/* Actions rapides */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCreerDevis(selectedClient.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Créer un devis pour ce client
                  </Button>
                  <Button
                    onClick={() => handleAjouterVehicule(selectedClient.id)}
                    variant="outline"
                    className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un véhicule
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedClient(selectedClient);
                      setIsEditDialogOpen(true);
                    }}
                    variant="outline"
                    className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    onClick={() => handleArchiver(selectedClient.id)}
                    variant="outline"
                    className="border-red-500/30 bg-white text-red-700 hover:bg-red-50"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archiver
                  </Button>
                </div>

                {/* Liste des véhicules */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    Véhicules associés ({selectedClient.vehicules.length})
                  </h3>
                  {selectedClient.vehicules.length === 0 ? (
                    <div className="p-6 text-center bg-blue-50/50 rounded-lg border border-blue-200/50 border-dashed">
                      <Car className="h-8 w-8 text-blue-600/30 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucun véhicule enregistré</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.vehicules.map((vehicule) => (
                        <div
                          key={vehicule.id}
                          className="p-3 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {vehicule.marque} {vehicule.modele}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>{vehicule.immatriculation}</span>
                                {vehicule.annee && <span>{vehicule.annee}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Derniers devis */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Derniers devis ({selectedClient.devis.length})
                  </h3>
                  {selectedClient.devis.length === 0 ? (
                    <div className="p-6 text-center bg-blue-50/50 rounded-lg border border-blue-200/50 border-dashed">
                      <FileText className="h-8 w-8 text-blue-600/30 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucun devis</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.devis.map((devis) => (
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

                {/* Dernières factures */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Dernières factures ({selectedClient.factures.length})
                  </h3>
                  {selectedClient.factures.length === 0 ? (
                    <div className="p-6 text-center bg-blue-50/50 rounded-lg border border-blue-200/50 border-dashed">
                      <FileText className="h-8 w-8 text-blue-600/30 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucune facture</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.factures.map((facture) => (
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
              </div>
            )}
          </DialogContent>
        </Dialog>

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

