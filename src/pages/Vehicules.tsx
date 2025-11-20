import { useState, useEffect, useMemo } from "react";
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
import { DashboardLayout } from "@/components/DashboardLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  Plus,
  Search,
  Car,
  User,
  FileText,
  Receipt,
  Mail,
  Calendar,
  Gauge,
  Wrench,
  MessageSquare,
  Send,
  Upload,
  Link as LinkIcon,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

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
  documents: Document[];
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

interface Document {
  id: string;
  nom: string;
  type: string;
  date: string;
  taille?: string;
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
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<"véhicule_prêt" | "document_manquant" | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  // États des données depuis Supabase
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [clientsList, setClientsList] = useState<{ id: string; nom: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États du formulaire de création/modification
  const [formClientId, setFormClientId] = useState<string>("");
  const [formImmatriculation, setFormImmatriculation] = useState("");
  const [formMarque, setFormMarque] = useState("");
  const [formModele, setFormModele] = useState("");
  const [formAnnee, setFormAnnee] = useState<string>("");
  const [formKilometrage, setFormKilometrage] = useState<string>("");
  const [editingVehiculeId, setEditingVehiculeId] = useState<string | null>(null);

  // Charger les clients depuis Supabase
  useEffect(() => {
    const loadClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom')
        .eq('statut', 'actif')
        .order('nom');
      
      if (error) {
        console.error('Erreur chargement clients:', error);
      } else {
        setClientsList(data || []);
      }
    };
    loadClients();
  }, []);

  // Charger les véhicules depuis Supabase
  const loadVehicules = async () => {
    setLoading(true);
    try {
      const { data: vehiculesData, error: vehiculesError } = await supabase
        .from('vehicules')
        .select(`
          *,
          clients:client_id (id, nom)
        `)
        .order('immatriculation');

      if (vehiculesError) {
        throw vehiculesError;
      }

      const vehiculesWithRelations = await Promise.all(
        (vehiculesData || []).map(async (v: any) => {
          const client = Array.isArray(v.clients) ? v.clients[0] : v.clients;

          const { data: devisData } = await supabase
            .from('devis')
            .select('id, numero, date, montant_ttc, statut')
            .eq('vehicule_id', v.id)
            .order('date', { ascending: false });

          let facturesData = null;
          try {
            const { data } = await supabase
              .from('factures')
              .select('id, numero, date, montant_ttc, statut_paiement')
              .eq('vehicule_id', v.id)
              .order('date', { ascending: false });
            facturesData = data;
          } catch (error) {
            // Ignorer si la table n'existe pas
          }

          return {
            id: v.id,
            immatriculation: v.immatriculation,
            marque: v.marque,
            modele: v.modele,
            annee: v.annee || 0,
            kilometrage: v.kilometrage || 0,
            clientId: v.client_id,
            clientNom: client?.nom || '',
            nbDevis: devisData?.length || 0,
            nbInterventions: 0,
            infosTechniques: {},
            notesTechniques: [],
            devis: (devisData || []).map((d: any) => ({
              id: d.id,
              numero: d.numero,
              date: d.date,
              montant: Number(d.montant_ttc),
              statut: d.statut as "brouillon" | "envoyé" | "accepté" | "refusé",
            })),
            factures: (facturesData || []).map((f: any) => ({
              id: f.id,
              numero: f.numero,
              date: f.date,
              montant: Number(f.montant_ttc),
              statut: f.statut_paiement === 'payé' ? 'payé' as const : 
                      f.statut_paiement === 'en_attente' ? 'à payer' as const : 'en retard' as const,
            })),
            documents: [],
            notifications: [],
          } as Vehicule;
        })
      );

      setVehicules(vehiculesWithRelations);
    } catch (error: any) {
      console.error('Erreur lors du chargement des véhicules:', error);
      toast.error('Erreur', {
        description: error.message || 'Impossible de charger les véhicules',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicules();
  }, []);

  const marques = useMemo(() => Array.from(new Set(vehicules.map((v) => v.marque))), [vehicules]);

  const filteredVehicules = useMemo(() => {
    return vehicules.filter((vehicule) => {
      const matchesImmatriculation =
        searchImmatriculation === "" ||
        vehicule.immatriculation.toLowerCase().includes(searchImmatriculation.toLowerCase());
      const matchesMarque = marqueFilter === "all" || vehicule.marque === marqueFilter;
      const matchesClient = clientFilter === "all" || vehicule.clientId === clientFilter;

      return matchesImmatriculation && matchesMarque && matchesClient;
    });
  }, [vehicules, searchImmatriculation, marqueFilter, clientFilter]);

  // Fonction pour créer un véhicule
  const handleCreateVehicule = async () => {
    if (!formClientId || !formImmatriculation.trim() || !formMarque.trim() || !formModele.trim()) {
      toast.error("Données incomplètes", {
        description: "Veuillez remplir le client, l'immatriculation, la marque et le modèle",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('vehicules')
        .insert([
          {
            client_id: formClientId,
            immatriculation: formImmatriculation.trim(),
            marque: formMarque.trim(),
            modele: formModele.trim(),
            annee: formAnnee ? parseInt(formAnnee) : null,
            kilometrage: formKilometrage ? parseInt(formKilometrage) : null,
          },
        ]);

      if (error) {
        throw error;
      }

      toast.success("Véhicule créé", {
        description: `Le véhicule ${formImmatriculation} a été créé avec succès`,
      });

      // Réinitialiser le formulaire
      setFormClientId("");
      setFormImmatriculation("");
      setFormMarque("");
      setFormModele("");
      setFormAnnee("");
      setFormKilometrage("");

      // Fermer la modal
      setIsCreateDialogOpen(false);

      // Recharger les véhicules
      await loadVehicules();
    } catch (error: any) {
      console.error('Erreur lors de la création du véhicule:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible de créer le véhicule",
      });
    }
  };

  // Fonction pour modifier un véhicule
  const handleEditVehicule = (vehicule: Vehicule) => {
    setEditingVehiculeId(vehicule.id);
    setFormClientId(vehicule.clientId);
    setFormImmatriculation(vehicule.immatriculation);
    setFormMarque(vehicule.marque);
    setFormModele(vehicule.modele);
    setFormAnnee(vehicule.annee ? vehicule.annee.toString() : "");
    setFormKilometrage(vehicule.kilometrage ? vehicule.kilometrage.toString() : "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateVehicule = async () => {
    if (!editingVehiculeId) return;

    if (!formClientId || !formImmatriculation.trim() || !formMarque.trim() || !formModele.trim()) {
      toast.error("Données incomplètes", {
        description: "Veuillez remplir le client, l'immatriculation, la marque et le modèle",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('vehicules')
        .update({
          client_id: formClientId,
          immatriculation: formImmatriculation.trim(),
          marque: formMarque.trim(),
          modele: formModele.trim(),
          annee: formAnnee ? parseInt(formAnnee) : null,
          kilometrage: formKilometrage ? parseInt(formKilometrage) : null,
        })
        .eq('id', editingVehiculeId);

      if (error) {
        throw error;
      }

      toast.success("Véhicule modifié", {
        description: `Le véhicule ${formImmatriculation} a été modifié avec succès`,
      });

      // Réinitialiser le formulaire
      setFormClientId("");
      setFormImmatriculation("");
      setFormMarque("");
      setFormModele("");
      setFormAnnee("");
      setFormKilometrage("");
      setEditingVehiculeId(null);

      // Fermer la modal
      setIsEditDialogOpen(false);

      // Recharger les véhicules
      await loadVehicules();
    } catch (error: any) {
      console.error('Erreur lors de la modification du véhicule:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible de modifier le véhicule",
      });
    }
  };

  // Fonction pour supprimer un véhicule
  const handleDeleteVehicule = async (vehiculeId: string, immatriculation: string) => {
    try {
      const { error } = await supabase
        .from('vehicules')
        .delete()
        .eq('id', vehiculeId);

      if (error) {
        throw error;
      }

      // Mettre à jour la liste localement
      setVehicules(prev => prev.filter(v => v.id !== vehiculeId));

      toast.success("Véhicule supprimé", {
        description: `Le véhicule ${immatriculation} a été supprimé`,
      });

      // Si le véhicule supprimé était sélectionné, désélectionner
      if (selectedVehicule?.id === vehiculeId) {
        setSelectedVehicule(null);
      }

      // Recharger les véhicules
      await loadVehicules();
    } catch (error: any) {
      console.error('Erreur lors de la suppression du véhicule:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible de supprimer le véhicule. Il est peut-être lié à des devis.",
      });
    }
  };

  const handleSelectVehicule = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
  };

  const handleNotifierVehiculePret = () => {
    if (selectedVehicule) {
      setNotificationType("véhicule_prêt");
      setNotificationMessage(
        `Bonjour,\n\nVotre véhicule ${selectedVehicule.marque} ${selectedVehicule.modele} (${selectedVehicule.immatriculation}) est prêt à être récupéré.\n\nVous pouvez venir le récupérer aux horaires d'ouverture du garage.\n\nCordialement,`
      );
      setIsNotificationDialogOpen(true);
    }
  };

  const handleDemanderDocument = () => {
    if (selectedVehicule) {
      setNotificationType("document_manquant");
      setNotificationMessage(
        `Bonjour,\n\nPour finaliser le dossier de votre véhicule ${selectedVehicule.marque} ${selectedVehicule.modele} (${selectedVehicule.immatriculation}), nous aurions besoin du document suivant :\n\n- [Précisez le document : carte grise, RIB, etc.]\n\nMerci de bien vouloir nous le transmettre.\n\nCordialement,`
      );
      setIsNotificationDialogOpen(true);
    }
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
      setNotificationType(null);
      setNotificationMessage("");
    }
  };

  const getStatusBadge = (statut: string) => {
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

  // Trier les événements (devis + factures) par date
  const getHistorique = () => {
    if (!selectedVehicule) return [];
    const historique: Array<{
      id: string;
      type: "devis" | "facture";
      numero: string;
      date: string;
      montant: number;
      statut: string;
    }> = [];

    selectedVehicule.devis.forEach((devis) => {
      historique.push({
        id: devis.id,
        type: "devis",
        numero: devis.numero,
        date: devis.date,
        montant: devis.montant,
        statut: devis.statut,
      });
    });

    selectedVehicule.factures.forEach((facture) => {
      historique.push({
        id: facture.id,
        type: "facture",
        numero: facture.numero,
        date: facture.date,
        montant: facture.montant,
        statut: facture.statut,
      });
    });

    return historique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between p-6 border-b border-blue-200/50 bg-white">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                HISTORIQUE DES VÉHICULES
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Gestion des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Véhicules
                </span>
              </h1>
              <p className="text-sm text-gray-600">Retrouvez tout l'historique d'un véhicule par immatriculation</p>
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

        {/* Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Colonne gauche - Liste des véhicules */}
          <div className="w-1/3 border-r border-blue-200/50 bg-white flex flex-col">
            {/* Recherche et filtres */}
            <div className="p-4 border-b border-blue-200/50 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par immatriculation..."
                  value={searchImmatriculation}
                  onChange={(e) => setSearchImmatriculation(e.target.value)}
                  className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={marqueFilter} onValueChange={setMarqueFilter}>
                  <SelectTrigger className="h-8 text-xs bg-white border-blue-300/50 text-gray-900">
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
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="h-8 text-xs bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {clientsList.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Liste des véhicules */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <p className="text-sm text-gray-600">Chargement des véhicules...</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredVehicules.map((vehicule) => (
                  <Card
                    key={vehicule.id}
                    onClick={() => handleSelectVehicule(vehicule)}
                    className={`cursor-pointer transition-all border ${
                      selectedVehicule?.id === vehicule.id
                        ? "border-blue-500 bg-blue-50/50 shadow-md"
                        : "border-blue-200/50 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Car className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 truncate">{vehicule.immatriculation}</p>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditVehicule(vehicule);
                                }}
                                className="h-6 w-6 p-0 hover:bg-blue-50 text-blue-600"
                                title="Modifier le véhicule"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVehicule(vehicule.id, vehicule.immatriculation);
                                }}
                                className="h-6 w-6 p-0 hover:bg-red-50 text-red-600"
                                title="Supprimer le véhicule"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {vehicule.marque} {vehicule.modele}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="truncate">{vehicule.clientNom}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Gauge className="h-3 w-3" />
                              <span>{vehicule.kilometrage.toLocaleString()} km</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                  {filteredVehicules.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <Car className="h-12 w-12 mb-3 text-gray-400" />
                      <p className="text-gray-700/60">Aucun véhicule trouvé</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Fiche dossier */}
          <div className="flex-1 bg-gradient-to-br from-white via-blue-50/30 to-white overflow-hidden flex flex-col">
            {selectedVehicule ? (
              <>
                {/* Header fiche */}
                <div className="p-6 border-b border-blue-200/50 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedVehicule.immatriculation}</h2>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                          {selectedVehicule.marque}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                          {selectedVehicule.annee}
                        </Badge>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                          <Gauge className="mr-1 h-3 w-3" />
                          {selectedVehicule.kilometrage.toLocaleString()} km
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedVehicule.marque} {selectedVehicule.modele} • Client: {selectedVehicule.clientNom}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditVehicule(selectedVehicule)}
                        className="h-8 px-2 hover:bg-blue-50"
                        title="Modifier le véhicule"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteVehicule(selectedVehicule.id, selectedVehicule.immatriculation)}
                        className="h-8 px-2 hover:bg-red-50 text-red-600"
                        title="Supprimer le véhicule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Onglets */}
                <Tabs defaultValue="historique" className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-6 pt-4 border-b border-blue-200/50 bg-white">
                    <TabsList className="bg-white">
                      <TabsTrigger value="historique" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                        <Clock className="mr-2 h-4 w-4" />
                        Historique
                      </TabsTrigger>
                      <TabsTrigger value="technique" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                        <Wrench className="mr-2 h-4 w-4" />
                        Dossier technique
                      </TabsTrigger>
                      <TabsTrigger value="communication" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Communication client
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Contenu des onglets */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <TabsContent value="historique" className="mt-0">
                      <Card className="border border-blue-200/50 bg-white">
                        <CardHeader>
                          <CardTitle className="text-gray-900">Timeline des devis et factures</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {getHistorique().map((item) => (
                              <div
                                key={item.id}
                                className="flex items-start gap-4 p-4 border border-blue-200/50 rounded-lg hover:bg-blue-50/50 transition-colors"
                              >
                                <div className={`p-2 rounded-lg ${
                                  item.type === "devis" ? "bg-blue-100" : "bg-green-100"
                                }`}>
                                  {item.type === "devis" ? (
                                    <FileText className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <Receipt className="h-5 w-5 text-green-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <p className="font-semibold text-gray-900">{item.numero}</p>
                                    {getStatusBadge(item.statut)}
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(item.date), "d MMM yyyy", { locale: fr })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    {item.type === "devis" ? "Devis" : "Facture"} • {item.montant.toLocaleString()} €
                                  </p>
                                </div>
                              </div>
                            ))}
                            {getHistorique().length === 0 && (
                              <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                <p className="text-gray-700/60">Aucun historique</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="technique" className="mt-0">
                      <div className="space-y-6">
                        {/* Notes techniques */}
                        <Card className="border border-blue-200/50 bg-white">
                          <CardHeader>
                            <CardTitle className="text-gray-900">Notes techniques</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {selectedVehicule.notesTechniques.map((note) => (
                                <div
                                  key={note.id}
                                  className="p-4 border border-blue-200/50 rounded-lg bg-blue-50/30"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900">{note.auteur}</span>
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(note.date), "d MMM yyyy", { locale: fr })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{note.texte}</p>
                                </div>
                              ))}
                              {selectedVehicule.notesTechniques.length === 0 && (
                                <p className="text-sm text-gray-700/60">Aucune note technique</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card className="border border-blue-200/50 bg-white">
                          <CardHeader>
                            <CardTitle className="text-gray-900">Documents attachés</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {selectedVehicule.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-3 border border-blue-200/50 rounded-lg hover:bg-blue-50/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{doc.nom}</p>
                                      <p className="text-xs text-gray-500">{doc.type}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(doc.date), "d MMM yyyy", { locale: fr })}
                                    </span>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <LinkIcon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {selectedVehicule.documents.length === 0 && (
                                <p className="text-sm text-gray-700/60">Aucun document attaché</p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              className="mt-4 w-full border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Ajouter un document
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="communication" className="mt-0">
                      <Card className="border border-blue-200/50 bg-white">
                        <CardHeader>
                          <CardTitle className="text-gray-900">Communication client</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Boutons d'action */}
                          <div className="flex gap-3">
                            <Button
                              onClick={handleNotifierVehiculePret}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Notifier véhicule prêt
                            </Button>
                            <Button
                              onClick={handleDemanderDocument}
                              variant="outline"
                              className="flex-1 border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Demander un document
                            </Button>
                          </div>

                          {/* Historique des notifications */}
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Historique des notifications</h3>
                            <div className="space-y-2">
                              {selectedVehicule.notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  className="p-3 border border-blue-200/50 rounded-lg bg-blue-50/30"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {notif.type === "véhicule_prêt" ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <FileText className="h-4 w-4 text-blue-600" />
                                      )}
                                      <span className="text-xs font-medium text-gray-900">
                                        {notif.type === "véhicule_prêt" ? "Véhicule prêt" : "Document manquant"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {getStatusBadge(notif.statut)}
                                      <span className="text-xs text-gray-500">
                                        {format(new Date(notif.date), "d MMM yyyy", { locale: fr })}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-700">{notif.message}</p>
                                </div>
                              ))}
                              {selectedVehicule.notifications.length === 0 && (
                                <p className="text-sm text-gray-700/60">Aucune notification envoyée</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Car className="h-16 w-16 mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun véhicule sélectionné</h3>
                <p className="text-sm text-gray-600">Sélectionnez un véhicule dans la liste pour voir son dossier</p>
              </div>
            )}
          </div>
        </div>

        {/* Dialog Notification */}
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {notificationType === "véhicule_prêt" ? "Notifier véhicule prêt" : "Demander un document"}
              </DialogTitle>
              <DialogDescription className="text-gray-700/70">
                {notificationType === "véhicule_prêt"
                  ? "Envoyer un message au client pour l'informer que son véhicule est prêt"
                  : "Envoyer une demande de document au client"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                <Textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={8}
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

        {/* Dialog Créer véhicule */}
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            // Réinitialiser le formulaire à la fermeture
            setFormClientId("");
            setFormImmatriculation("");
            setFormMarque("");
            setFormModele("");
            setFormAnnee("");
            setFormKilometrage("");
          }
        }}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Créer un véhicule</DialogTitle>
              <DialogDescription className="text-gray-700/70">Ajouter un nouveau véhicule à la base</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Client <span className="text-red-500">*</span>
                </label>
                <Select value={formClientId} onValueChange={setFormClientId}>
                  <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    {clientsList.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Immatriculation <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formImmatriculation}
                    onChange={(e) => setFormImmatriculation(e.target.value)}
                    placeholder="AB-123-CD"
                    className="bg-white border-blue-300/50 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Marque <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formMarque}
                    onChange={(e) => setFormMarque(e.target.value)}
                    placeholder="Peugeot"
                    className="bg-white border-blue-300/50 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Modèle <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formModele}
                    onChange={(e) => setFormModele(e.target.value)}
                    placeholder="308"
                    className="bg-white border-blue-300/50 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Année</label>
                  <Input
                    type="number"
                    value={formAnnee}
                    onChange={(e) => setFormAnnee(e.target.value)}
                    placeholder="2019"
                    className="bg-white border-blue-300/50 text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Kilométrage</label>
                  <Input
                    type="number"
                    value={formKilometrage}
                    onChange={(e) => setFormKilometrage(e.target.value)}
                    placeholder="85000"
                    className="bg-white border-blue-300/50 text-gray-900"
                  />
                </div>
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
                  onClick={handleCreateVehicule}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Modifier véhicule */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Réinitialiser le formulaire à la fermeture
            setFormClientId("");
            setFormImmatriculation("");
            setFormMarque("");
            setFormModele("");
            setFormAnnee("");
            setFormKilometrage("");
            setEditingVehiculeId(null);
          }
        }}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Modifier le véhicule</DialogTitle>
              <DialogDescription className="text-gray-700/70">Modifiez les informations du véhicule</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Client <span className="text-red-500">*</span>
                </label>
                <Select value={formClientId} onValueChange={setFormClientId}>
                  <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    {clientsList.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Immatriculation <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formImmatriculation}
                    onChange={(e) => setFormImmatriculation(e.target.value)}
                    placeholder="AB-123-CD"
                    className="bg-white border-blue-300/50 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Marque <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formMarque}
                    onChange={(e) => setFormMarque(e.target.value)}
                    placeholder="Peugeot"
                    className="bg-white border-blue-300/50 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Modèle <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formModele}
                    onChange={(e) => setFormModele(e.target.value)}
                    placeholder="308"
                    className="bg-white border-blue-300/50 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Année</label>
                  <Input
                    type="number"
                    value={formAnnee}
                    onChange={(e) => setFormAnnee(e.target.value)}
                    placeholder="2019"
                    className="bg-white border-blue-300/50 text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Kilométrage</label>
                  <Input
                    type="number"
                    value={formKilometrage}
                    onChange={(e) => setFormKilometrage(e.target.value)}
                    placeholder="85000"
                    className="bg-white border-blue-300/50 text-gray-900"
                  />
                </div>
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
                  onClick={handleUpdateVehicule}
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

export default Vehicules;
