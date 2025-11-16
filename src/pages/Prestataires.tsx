import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  MapPin,
  Building2,
  FileText,
  Mail as MailIcon,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Archive,
  Upload,
  User,
  Briefcase,
  Calendar,
} from "lucide-react";

interface Prestataire {
  id: string;
  nomEntreprise: string;
  nomContact: string;
  telephone: string;
  email: string;
  metier: string;
  adresse: string;
  siret?: string;
  statut: "Actif" | "À relancer" | "Inactif";
  nbChantiers: number;
  dernierContact: string;
  chantiers: ChantierAssocie[];
  relances: Relance[];
  documents: Document[];
}

interface ChantierAssocie {
  id: string;
  nom: string;
  statut: string;
  role: string;
  derniereIntervention: string;
}

interface Relance {
  id: string;
  date: string;
  type: "Email" | "Appel" | "SMS";
  resultat: "Relancé" | "En attente" | "Pas de réponse";
}

interface Document {
  id: string;
  nom: string;
  type: "Devis" | "Contrat" | "Attestation" | "Autre";
  date: string;
  url: string;
}

const Prestataires = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [selectedPrestataire, setSelectedPrestataire] = useState<Prestataire | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const prestataires: Prestataire[] = [
    {
      id: "1",
      nomEntreprise: "Plomberie Duval",
      nomContact: "Jean Duval",
      telephone: "06 00 00 00 00",
      email: "contact@duvalpro.fr",
      metier: "Plomberie générale",
      adresse: "12 Rue de la République, 34000 Montpellier",
      siret: "123 456 789 00012",
      statut: "À relancer",
      nbChantiers: 3,
      dernierContact: "2025-11-14",
      chantiers: [
        { id: "c1", nom: "Rénovation T3 – Champs-Élysées", statut: "En cours", role: "Plomberie", derniereIntervention: "2025-11-10" },
        { id: "c2", nom: "Résidence Les Chênes", statut: "En cours", role: "Plomberie", derniereIntervention: "2025-11-05" },
        { id: "c3", nom: "Rénovation Béziers Centre", statut: "En cours", role: "Plomberie", derniereIntervention: "2025-10-28" },
      ],
      relances: [
        { id: "r1", date: "2025-11-14", type: "Email", resultat: "En attente" },
        { id: "r2", date: "2025-11-10", type: "Appel", resultat: "Relancé" },
        { id: "r3", date: "2025-11-05", type: "SMS", resultat: "Pas de réponse" },
      ],
      documents: [
        { id: "d1", nom: "Devis Plomberie - Champs-Élysées.pdf", type: "Devis", date: "2025-10-20", url: "#" },
        { id: "d2", nom: "Contrat Plomberie Duval.pdf", type: "Contrat", date: "2025-09-15", url: "#" },
      ],
    },
    {
      id: "2",
      nomEntreprise: "Élec Ouest",
      nomContact: "Marie Martin",
      telephone: "06 11 11 11 11",
      email: "info@elec-ouest.fr",
      metier: "Électricité résidentielle",
      adresse: "45 Avenue de l'Europe, 34000 Montpellier",
      siret: "987 654 321 00034",
      statut: "Actif",
      nbChantiers: 2,
      dernierContact: "2025-11-15",
      chantiers: [
        { id: "c4", nom: "Rénovation Béziers Centre", statut: "En cours", role: "Électricité", derniereIntervention: "2025-11-12" },
        { id: "c5", nom: "Programme Neuf Narbonne", statut: "En cours", role: "Électricité", derniereIntervention: "2025-11-08" },
      ],
      relances: [
        { id: "r4", date: "2025-11-15", type: "Email", resultat: "Relancé" },
        { id: "r5", date: "2025-11-10", type: "Appel", resultat: "Relancé" },
      ],
      documents: [
        { id: "d3", nom: "Devis Électricité - Béziers.pdf", type: "Devis", date: "2025-10-22", url: "#" },
        { id: "d4", nom: "Attestation assurance Élec Ouest.pdf", type: "Attestation", date: "2025-09-01", url: "#" },
      ],
    },
    {
      id: "3",
      nomEntreprise: "Menuiserie Concept",
      nomContact: "Pierre Dubois",
      telephone: "06 22 22 22 22",
      email: "contact@menuiserie-concept.fr",
      metier: "Menuiserie",
      adresse: "8 Rue des Artisans, 34500 Béziers",
      statut: "Inactif",
      nbChantiers: 0,
      dernierContact: "2025-10-01",
      chantiers: [],
      relances: [
        { id: "r6", date: "2025-10-01", type: "Email", resultat: "Pas de réponse" },
        { id: "r7", date: "2025-09-25", type: "Appel", resultat: "Pas de réponse" },
      ],
      documents: [
        { id: "d5", nom: "Devis Menuiserie - Ancien.pdf", type: "Devis", date: "2025-08-15", url: "#" },
      ],
    },
    {
      id: "4",
      nomEntreprise: "Gros Œuvre Biterrois",
      nomContact: "Sophie Lambert",
      telephone: "06 33 33 33 33",
      email: "info@gros-oeuvre-34.fr",
      metier: "Gros œuvre",
      adresse: "25 Avenue de la Gare, 34500 Béziers",
      siret: "456 789 123 00056",
      statut: "Actif",
      nbChantiers: 5,
      dernierContact: "2025-11-16",
      chantiers: [
        { id: "c6", nom: "Programme Neuf Narbonne", statut: "En cours", role: "Gros œuvre", derniereIntervention: "2025-11-14" },
        { id: "c7", nom: "Résidence Les Chênes", statut: "En cours", role: "Gros œuvre", derniereIntervention: "2025-11-10" },
        { id: "c8", nom: "Villa Agde", statut: "Terminé", role: "Gros œuvre", derniereIntervention: "2025-09-20" },
        { id: "c9", nom: "Rénovation Béziers Centre", statut: "En cours", role: "Gros œuvre", derniereIntervention: "2025-11-05" },
        { id: "c10", nom: "Appartement Montpellier Nord", statut: "En cours", role: "Gros œuvre", derniereIntervention: "2025-11-01" },
      ],
      relances: [
        { id: "r8", date: "2025-11-16", type: "Appel", resultat: "Relancé" },
        { id: "r9", date: "2025-11-12", type: "Email", resultat: "Relancé" },
      ],
      documents: [
        { id: "d6", nom: "Contrat Gros Œuvre Biterrois.pdf", type: "Contrat", date: "2025-08-01", url: "#" },
        { id: "d7", nom: "Devis Gros Œuvre - Narbonne.pdf", type: "Devis", date: "2025-09-15", url: "#" },
      ],
    },
    {
      id: "5",
      nomEntreprise: "Peinture & Déco 34",
      nomContact: "Luc Bernard",
      telephone: "06 44 44 44 44",
      email: "contact@peinture-deco-34.fr",
      metier: "Peinture",
      adresse: "15 Rue de la Peinture, 34000 Montpellier",
      statut: "Actif",
      nbChantiers: 3,
      dernierContact: "2025-11-13",
      chantiers: [
        { id: "c11", nom: "Rénovation T3 – Champs-Élysées", statut: "En cours", role: "Peinture", derniereIntervention: "2025-11-12" },
        { id: "c12", nom: "Résidence Les Chênes", statut: "En cours", role: "Peinture", derniereIntervention: "2025-11-08" },
        { id: "c13", nom: "Villa Agde", statut: "Terminé", role: "Peinture", derniereIntervention: "2025-09-15" },
      ],
      relances: [
        { id: "r10", date: "2025-11-13", type: "SMS", resultat: "Relancé" },
      ],
      documents: [
        { id: "d8", nom: "Devis Peinture - Champs-Élysées.pdf", type: "Devis", date: "2025-10-25", url: "#" },
      ],
    },
    {
      id: "6",
      nomEntreprise: "Carrelage Sud",
      nomContact: "Antoine Moreau",
      telephone: "06 55 55 55 55",
      email: "info@carrelage-sud.fr",
      metier: "Carrelage",
      adresse: "30 Boulevard de la Mer, 11100 Narbonne",
      statut: "Actif",
      nbChantiers: 2,
      dernierContact: "2025-11-12",
      chantiers: [
        { id: "c14", nom: "Rénovation Béziers Centre", statut: "En cours", role: "Carrelage", derniereIntervention: "2025-11-10" },
        { id: "c15", nom: "Appartement Montpellier Nord", statut: "En cours", role: "Carrelage", derniereIntervention: "2025-11-05" },
      ],
      relances: [
        { id: "r11", date: "2025-11-12", type: "Email", resultat: "En attente" },
      ],
      documents: [],
    },
  ];

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "Actif":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Actif</Badge>;
      case "À relancer":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">À relancer</Badge>;
      case "Inactif":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactif</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const getRelanceIcon = (type: string) => {
    switch (type) {
      case "Email":
        return <MailIcon className="h-4 w-4 text-red-400" />;
      case "Appel":
        return <Phone className="h-4 w-4 text-orange-400" />;
      case "SMS":
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      default:
        return <MailIcon className="h-4 w-4" />;
    }
  };

  const getRelanceResultatBadge = (resultat: string) => {
    switch (resultat) {
      case "Relancé":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Relancé</Badge>;
      case "En attente":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">En attente</Badge>;
      case "Pas de réponse":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Pas de réponse</Badge>;
      default:
        return <Badge variant="secondary">{resultat}</Badge>;
    }
  };

  const getDocumentIcon = (type: string) => {
    return <FileText className="h-4 w-4 text-red-400" />;
  };

  const filteredPrestataires = prestataires.filter((prestataire) => {
    const matchesSearch =
      prestataire.nomEntreprise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prestataire.nomContact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prestataire.metier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || prestataire.statut === statusFilter;
    const matchesSpecialty = specialtyFilter === "all" || prestataire.metier === specialtyFilter;

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const specialites = Array.from(new Set(prestataires.map((p) => p.metier)));

  const handleOpenFiche = (prestataire: Prestataire) => {
    setSelectedPrestataire(prestataire);
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-red-50">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-300">Réseau d'intervenants</p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Liste des{" "}
                <span className="bg-gradient-to-r from-red-200 via-red-400 to-red-300 bg-clip-text text-transparent">
                  Prestataires
                </span>
              </h1>
              <p className="text-sm text-red-100/80">
                Suivez vos intervenants, relancez-les facilement et attribuez-les à vos chantiers
              </p>
            </div>
            <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un prestataire
            </Button>
          </div>
        </BlurFade>

        {/* Barre de recherche et filtres */}
        <BlurFade inView delay={0.05}>
          <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-300/60" />
                  <Input
                    placeholder="Rechercher un prestataire (nom, métier, société)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/40 border-red-500/30 text-red-100 placeholder:text-red-300/50 focus:border-red-400"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-black/40 border-red-500/30 text-red-100">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-red-900/40 text-red-100">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="À relancer">À relancer</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-black/40 border-red-500/30 text-red-100">
                    <SelectValue placeholder="Spécialité" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-red-900/40 text-red-100">
                    <SelectItem value="all">Toutes les spécialités</SelectItem>
                    {specialites.map((specialite) => (
                      <SelectItem key={specialite} value={specialite}>
                        {specialite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Grille de cartes prestataires */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrestataires.map((prestataire, idx) => (
            <BlurFade key={prestataire.id} inView delay={0.1 * (idx + 1)}>
              <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
                <CardContent className="p-6">
                  {/* Header carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                        <Briefcase className="h-6 w-6 text-red-400" />
                      </div>
                      <div className="flex-1">
                        {getStatusBadge(prestataire.statut)}
                      </div>
                    </div>
                  </div>

                  {/* Nom entreprise */}
                  <h3 className="text-lg font-bold text-white mb-1">{prestataire.nomEntreprise}</h3>
                  <p className="text-sm text-red-200/70 mb-3">{prestataire.metier}</p>

                  {/* Contact */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-red-200/80">
                      <Phone className="h-4 w-4 text-red-400" />
                      <span>{prestataire.telephone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-200/80">
                      <Mail className="h-4 w-4 text-red-400" />
                      <span className="truncate">{prestataire.email}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-red-950/20 rounded-lg border border-red-900/30">
                    <div>
                      <p className="text-xs text-red-300/60 mb-1">Chantiers</p>
                      <p className="text-lg font-semibold text-white">{prestataire.nbChantiers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-300/60 mb-1">Dernier contact</p>
                      <p className="text-sm font-medium text-red-100">
                        {new Date(prestataire.dernierContact).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenFiche(prestataire)}
                      className="flex-1 bg-red-500/10 border-red-500/30 text-red-100 hover:bg-red-500/20"
                      variant="outline"
                      size="sm"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Voir fiche
                    </Button>
                    <Button
                      className="bg-red-500/10 border-red-500/30 text-red-100 hover:bg-red-500/20"
                      variant="outline"
                      size="sm"
                    >
                      <MailIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      className="bg-black/40 border-red-500/30 text-red-100 hover:bg-red-500/10"
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>

        {filteredPrestataires.length === 0 && (
          <div className="text-center py-12">
            <p className="text-red-200/60">Aucun prestataire trouvé</p>
          </div>
        )}

        {/* Dialog Fiche détaillée */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border-red-900/40 text-red-50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-red-400" />
                {selectedPrestataire?.nomEntreprise}
              </DialogTitle>
              <DialogDescription className="text-red-200/70">
                Fiche complète du prestataire
              </DialogDescription>
            </DialogHeader>

            {selectedPrestataire && (
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="p-4 bg-red-950/20 rounded-lg border border-red-900/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-red-400" />
                    Informations générales
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-red-300/60 mb-1">Nom du contact</p>
                      <p className="text-sm font-medium text-white">{selectedPrestataire.nomContact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-300/60 mb-1">Métier</p>
                      <p className="text-sm font-medium text-white">{selectedPrestataire.metier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-300/60 mb-1">Téléphone</p>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                        <Phone className="h-4 w-4 text-red-400" />
                        {selectedPrestataire.telephone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-red-300/60 mb-1">Email</p>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-red-400" />
                        {selectedPrestataire.email}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-red-300/60 mb-1">Adresse</p>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-400" />
                        {selectedPrestataire.adresse}
                      </p>
                    </div>
                    {selectedPrestataire.siret && (
                      <div>
                        <p className="text-xs text-red-300/60 mb-1">SIRET</p>
                        <p className="text-sm font-medium text-white">{selectedPrestataire.siret}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Chantiers associés */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-red-400" />
                        Chantiers associés ({selectedPrestataire.chantiers.length})
                      </h3>
                    </div>
                    {selectedPrestataire.chantiers.length === 0 ? (
                      <div className="p-6 text-center bg-red-950/10 rounded-lg border border-red-900/20 border-dashed">
                        <Building2 className="h-8 w-8 text-red-300/30 mx-auto mb-2" />
                        <p className="text-sm text-red-200/60">Aucun chantier associé</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedPrestataire.chantiers.map((chantier) => (
                          <div
                            key={chantier.id}
                            className="p-3 bg-red-950/20 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-white text-sm">{chantier.nom}</h4>
                              {getStatusBadge(chantier.statut)}
                            </div>
                            <p className="text-xs text-red-200/70 mb-1">Rôle : {chantier.role}</p>
                            <p className="text-xs text-red-300/60">
                              Dernière intervention : {new Date(chantier.derniereIntervention).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Historique des relances */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-red-400" />
                        Historique des relances
                      </h3>
                      <Button
                        className="bg-red-500/20 border-red-500/30 text-red-100 hover:bg-red-500/30"
                        variant="outline"
                        size="sm"
                      >
                        <MailIcon className="mr-2 h-4 w-4" />
                        Relancer
                      </Button>
                    </div>
                    {selectedPrestataire.relances.length === 0 ? (
                      <div className="p-6 text-center bg-red-950/10 rounded-lg border border-red-900/20 border-dashed">
                        <Clock className="h-8 w-8 text-red-300/30 mx-auto mb-2" />
                        <p className="text-sm text-red-200/60">Aucune relance enregistrée</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedPrestataire.relances.map((relance, idx) => (
                          <div
                            key={relance.id}
                            className="relative pl-8 pb-4 border-l border-red-900/30 last:border-l-0 last:pb-0"
                          >
                            <div className="absolute -left-2 top-0">
                              <div className="h-4 w-4 rounded-full bg-red-500/30 border-2 border-red-500/50" />
                            </div>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getRelanceIcon(relance.type)}
                                  <span className="text-sm font-medium text-white">{relance.type}</span>
                                  <span className="text-xs text-red-300/60">
                                    {new Date(relance.date).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>
                                {getRelanceResultatBadge(relance.resultat)}
                              </div>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-300 hover:text-red-400">
                                <MailIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents associés */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-red-400" />
                      Documents associés ({selectedPrestataire.documents.length})
                    </h3>
                    <Button
                      className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Téléverser un document
                    </Button>
                  </div>
                  {selectedPrestataire.documents.length === 0 ? (
                    <div className="p-6 text-center bg-red-950/10 rounded-lg border border-red-900/20 border-dashed">
                      <FileText className="h-8 w-8 text-red-300/30 mx-auto mb-2" />
                      <p className="text-sm text-red-200/60">Aucun document associé</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedPrestataire.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-red-950/20 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {getDocumentIcon(doc.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{doc.nom}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                  {doc.type}
                                </Badge>
                                <span className="text-xs text-red-300/60">
                                  {new Date(doc.date).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions rapides */}
                <div className="p-4 bg-red-950/20 rounded-lg border border-red-900/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Button
                      className="w-full justify-start bg-red-500/10 border-red-500/30 text-red-100 hover:bg-red-500/20"
                      variant="outline"
                    >
                      <MailIcon className="mr-2 h-4 w-4" />
                      Envoyer une relance
                    </Button>
                    <Button
                      className="w-full justify-start bg-red-500/10 border-red-500/30 text-red-100 hover:bg-red-500/20"
                      variant="outline"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Ajouter une note
                    </Button>
                    <Button
                      className="w-full justify-start bg-red-500/10 border-red-500/30 text-red-100 hover:bg-red-500/20"
                      variant="outline"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Téléverser un document
                    </Button>
                    <Button
                      className="w-full justify-start bg-red-500/10 border-red-500/30 text-red-100 hover:bg-red-500/20"
                      variant="outline"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archiver le prestataire
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Prestataires;
