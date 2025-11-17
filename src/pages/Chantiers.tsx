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
  Building2,
  MapPin,
  Calendar,
  Users,
  Euro,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  Camera,
  X,
  ArrowRight,
} from "lucide-react";

interface Chantier {
  id: string;
  nom: string;
  client: string;
  adresse: string;
  dateDebut: string;
  dateFin: string;
  budget: number;
  equipe: string;
  statut: "En cours" | "Terminé" | "Bloqué";
  avancement: number;
  etapes: Etape[];
  photos: Photo[];
}

interface Etape {
  id: string;
  nom: string;
  description: string;
  datePrevue: string;
  faite: boolean;
}

interface Photo {
  id: string;
  url: string;
  date: string;
  etapeId: string;
}

const Chantiers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [equipeFilter, setEquipeFilter] = useState<string>("all");
  const [selectedChantier, setSelectedChantier] = useState<Chantier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const chantiers: Chantier[] = [
    {
      id: "1",
      nom: "Rénovation T3 – Champs-Élysées",
      client: "M. et Mme Dubois",
      adresse: "45 Avenue des Champs-Élysées, 75008 Paris",
      dateDebut: "2025-10-20",
      dateFin: "2025-10-31",
      budget: 15000,
      equipe: "Équipe Paris Nord",
      statut: "En cours",
      avancement: 67,
      etapes: [
        { id: "e1", nom: "Démolition", description: "Démolition des cloisons existantes", datePrevue: "2025-10-21", faite: true },
        { id: "e2", nom: "Électricité", description: "Installation électrique complète", datePrevue: "2025-10-23", faite: true },
        { id: "e3", nom: "Ponçage", description: "Ponçage des sols et préparation", datePrevue: "2025-10-25", faite: false },
      ],
      photos: [
        { id: "p1", url: "https://via.placeholder.com/300x200?text=Photo+1", date: "2025-10-22", etapeId: "e1" },
        { id: "p2", url: "https://via.placeholder.com/300x200?text=Photo+2", date: "2025-10-24", etapeId: "e2" },
      ],
    },
    {
      id: "2",
      nom: "Résidence Les Chênes",
      client: "M. Lambert",
      adresse: "12 Rue des Chênes, 34000 Montpellier",
      dateDebut: "2025-11-01",
      dateFin: "2025-12-05",
      budget: 25000,
      equipe: "Équipe Sud",
      statut: "En cours",
      avancement: 45,
      etapes: [
        { id: "e4", nom: "Gros œuvre", description: "Travaux de gros œuvre", datePrevue: "2025-11-05", faite: true },
        { id: "e5", nom: "Pose du parquet", description: "Pose du parquet – prévu le 2025-11-20", datePrevue: "2025-11-20", faite: false },
        { id: "e6", nom: "Peinture", description: "Peinture des murs", datePrevue: "2025-11-28", faite: false },
      ],
      photos: [
        { id: "p3", url: "https://via.placeholder.com/300x200?text=parquet_en_cours.jpg", date: "2025-11-14", etapeId: "e5" },
      ],
    },
    {
      id: "3",
      nom: "Rénovation Béziers Centre",
      client: "Mme Martin",
      adresse: "8 Place de la République, 34500 Béziers",
      dateDebut: "2025-09-15",
      dateFin: "2025-11-30",
      budget: 18000,
      equipe: "Équipe Ouest",
      statut: "En cours",
      avancement: 78,
      etapes: [
        { id: "e7", nom: "Plomberie", description: "Installation plomberie", datePrevue: "2025-10-10", faite: true },
        { id: "e8", nom: "Carrelage", description: "Pose carrelage salle de bain", datePrevue: "2025-10-25", faite: true },
        { id: "e9", nom: "Finitions", description: "Finitions et nettoyage", datePrevue: "2025-11-15", faite: false },
      ],
      photos: [],
    },
    {
      id: "4",
      nom: "Programme Neuf Narbonne",
      client: "Promoteur ABC",
      adresse: "25 Avenue de la Mer, 11100 Narbonne",
      dateDebut: "2025-08-01",
      dateFin: "2025-12-31",
      budget: 45000,
      equipe: "Équipe Est",
      statut: "En cours",
      avancement: 55,
      etapes: [
        { id: "e10", nom: "Fondations", description: "Travaux de fondations", datePrevue: "2025-08-15", faite: true },
        { id: "e11", nom: "Charpente", description: "Pose de la charpente", datePrevue: "2025-09-20", faite: true },
        { id: "e12", nom: "Isolation", description: "Isolation thermique", datePrevue: "2025-10-30", faite: false },
      ],
      photos: [],
    },
    {
      id: "5",
      nom: "Villa Agde",
      client: "M. et Mme Durand",
      adresse: "15 Chemin des Pins, 34300 Agde",
      dateDebut: "2025-07-10",
      dateFin: "2025-09-30",
      budget: 32000,
      equipe: "Équipe Sud",
      statut: "Terminé",
      avancement: 100,
      etapes: [
        { id: "e13", nom: "Rénovation complète", description: "Rénovation complète de la villa", datePrevue: "2025-08-15", faite: true },
        { id: "e14", nom: "Aménagement extérieur", description: "Aménagement jardin et terrasse", datePrevue: "2025-09-10", faite: true },
      ],
      photos: [],
    },
    {
      id: "6",
      nom: "Appartement Montpellier Nord",
      client: "M. Petit",
      adresse: "30 Rue de la République, 34000 Montpellier",
      dateDebut: "2025-10-01",
      dateFin: "2025-11-15",
      budget: 12000,
      equipe: "Équipe Nord",
      statut: "Bloqué",
      avancement: 30,
      etapes: [
        { id: "e15", nom: "Démolition", description: "Démolition préliminaire", datePrevue: "2025-10-05", faite: true },
        { id: "e16", nom: "Électricité", description: "Mise aux normes électriques", datePrevue: "2025-10-20", faite: false },
      ],
      photos: [],
    },
  ];

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "En cours":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">En cours</Badge>;
      case "Terminé":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Terminé</Badge>;
      case "Bloqué":
        return <Badge className="bg-red-500/20 text-blue-600 border-blue-300/50">Bloqué</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const filteredChantiers = chantiers.filter((chantier) => {
    const matchesSearch = chantier.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chantier.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chantier.adresse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || chantier.statut === statusFilter;
    const matchesEquipe = equipeFilter === "all" || chantier.equipe === equipeFilter;

    return matchesSearch && matchesStatus && matchesEquipe;
  });

  const equipes = Array.from(new Set(chantiers.map((c) => c.equipe)));

  const handleOpenTimeline = (chantier: Chantier) => {
    setSelectedChantier(chantier);
    setIsDialogOpen(true);
  };

  const etapesFaites = selectedChantier?.etapes.filter((e) => e.faite).length || 0;
  const totalEtapes = selectedChantier?.etapes.length || 0;
  const prochaineEtape = selectedChantier?.etapes.find((e) => !e.faite);

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Gestion de projets</p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Suivi des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Chantiers
                </span>
              </h1>
              <p className="text-sm text-gray-600">Gérez vos projets avec visibilité, checklist et photos</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Chantier
            </Button>
          </div>
        </BlurFade>

        {/* Barre de recherche et filtres */}
        <BlurFade inView delay={0.05}>
            <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un chantier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Terminé">Terminé</SelectItem>
                    <SelectItem value="Bloqué">Bloqué</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={equipeFilter} onValueChange={setEquipeFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Équipe" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Toutes les équipes</SelectItem>
                    {equipes.map((equipe) => (
                      <SelectItem key={equipe} value={equipe}>
                        {equipe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Grille de cartes chantier */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChantiers.map((chantier, idx) => (
            <BlurFade key={chantier.id} inView delay={0.1 * (idx + 1)}>
              <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group">
                <CardContent className="p-6">
                  {/* Header carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {getStatusBadge(chantier.statut)}
                      <p className="text-xs text-gray-700/60 mt-2">{chantier.equipe}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{chantier.budget.toLocaleString()} €</p>
                      <p className="text-xs text-gray-700/60">Budget</p>
                    </div>
                  </div>

                  {/* Nom chantier */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{chantier.nom}</h3>

                  {/* Client */}
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-700/80">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>{chantier.client}</span>
                  </div>

                  {/* Adresse */}
                  <div className="flex items-start gap-2 mb-4 text-sm text-gray-700/70">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{chantier.adresse}</span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 mb-4 text-xs text-gray-700/60">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    <span>
                      Du {new Date(chantier.dateDebut).toLocaleDateString("fr-FR")} au{" "}
                      {new Date(chantier.dateFin).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {/* Prochaine étape */}
                  {chantier.etapes.find((e) => !e.faite) && (
                    <div className="mb-4 p-3 bg-red-950/30 rounded-lg border border-blue-200/50">
                      <p className="text-xs text-blue-600/80 mb-1">Prochaine étape</p>
                      <p className="text-sm font-medium text-gray-700">
                        {chantier.etapes.find((e) => !e.faite)?.nom} – prévu le{" "}
                        {new Date(chantier.etapes.find((e) => !e.faite)!.datePrevue).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}

                  {/* Avancement */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700/80">
                        {chantier.etapes.filter((e) => e.faite).length}/{chantier.etapes.length} étapes – {chantier.avancement}%
                      </span>
                    </div>
                    <div className="h-2 bg-red-950/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                        style={{ width: `${chantier.avancement}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenTimeline(chantier)}
                      className="flex-1 bg-blue-50 border-blue-300/50 text-gray-700 hover:bg-red-500/20"
                      variant="outline"
                      size="sm"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Voir les étapes
                    </Button>
                    <Button
                      className="bg-white border-blue-300/50 text-gray-700 hover:bg-blue-50"
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

        {filteredChantiers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-700/60">Aucun chantier trouvé</p>
          </div>
        )}

        {/* Dialog Timeline */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-blue-200/50 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Timeline du chantier</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                {selectedChantier?.nom} – {selectedChantier?.adresse}
              </DialogDescription>
            </DialogHeader>

            {selectedChantier && (
              <div className="space-y-6">
                {/* Infos clés */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-red-950/20 rounded-lg border border-blue-200/50">
                  <div>
                    <p className="text-xs text-blue-600/60 mb-1">Statut</p>
                    <div>{getStatusBadge(selectedChantier.statut)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600/60 mb-1">Budget</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedChantier.budget.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600/60 mb-1">Équipe</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedChantier.equipe}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600/60 mb-1">Avancement</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {etapesFaites}/{totalEtapes} étapes – {selectedChantier.avancement}%
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Checklist étapes */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Étapes du chantier</h3>
                      <Button
                        className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter une étape
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {selectedChantier.etapes.map((etape) => (
                        <div
                          key={etape.id}
                          className="p-4 bg-red-950/20 rounded-lg border border-blue-200/50 hover:border-red-500/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {etape.faite ? (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                              ) : (
                                <Circle className="h-5 w-5 text-blue-600/50" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-semibold ${etape.faite ? "text-green-400 line-through" : "text-gray-900"}`}>
                                  {etape.nom}
                                </h4>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:text-blue-600">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:text-gray-9000">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700/70 mb-2">{etape.description}</p>
                              <p className="text-xs text-blue-600/60">
                                Date prévue : {new Date(etape.datePrevue).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Photos des étapes</h3>
                      <Button
                        className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                        variant="outline"
                        size="sm"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Ajouter une photo
                      </Button>
                    </div>

                    {selectedChantier.photos.length === 0 ? (
                      <div className="p-8 text-center bg-red-950/10 rounded-lg border border-red-900/20 border-dashed">
                        <Camera className="h-12 w-12 text-blue-600/30 mx-auto mb-3" />
                        <p className="text-sm text-gray-700/60">Aucune photo ajoutée</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedChantier.photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.url}
                              alt={`Photo ${photo.id}`}
                              className="w-full h-32 object-cover rounded-lg border border-blue-200/50"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <Button variant="ghost" size="sm" className="text-gray-900 hover:text-blue-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-900 hover:text-gray-9000">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-700/60 mt-1">
                              {new Date(photo.date).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
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

export default Chantiers;
