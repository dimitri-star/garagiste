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
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  Receipt,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { format, addDays, parseISO, isBefore, isAfter } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface TacheRelance {
  id: string;
  type: "relance devis" | "relance facture";
  numero: string; // n° devis ou facture
  client: string;
  vehicule?: string;
  dateEcheance: string;
  statut: "à faire" | "en cours" | "fait" | "reporté";
  montant?: number;
  dateCreation: string;
  note?: string;
  dateReport?: string;
}

const Relances = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedTache, setSelectedTache] = useState<TacheRelance | null>(null);
  const [isReporterDialogOpen, setIsReporterDialogOpen] = useState(false);
  const [joursReport, setJoursReport] = useState<number>(3);

  const [tachesRelances, setTachesRelances] = useState<TacheRelance[]>([
    {
      id: "1",
      type: "relance devis",
      numero: "DEV-2024-001",
      client: "Martin Dupont",
      vehicule: "AB-123-CD",
      dateEcheance: new Date().toISOString().split("T")[0],
      statut: "à faire",
      montant: 850,
      dateCreation: addDays(new Date(), -5).toISOString().split("T")[0],
      note: "Devis envoyé le 15/11, pas de réponse",
    },
    {
      id: "2",
      type: "relance devis",
      numero: "DEV-2024-002",
      client: "Sophie Bernard",
      vehicule: "EF-456-GH",
      dateEcheance: addDays(new Date(), -2).toISOString().split("T")[0],
      statut: "à faire",
      montant: 1200,
      dateCreation: addDays(new Date(), -8).toISOString().split("T")[0],
    },
    {
      id: "3",
      type: "relance facture",
      numero: "FAC-2024-045",
      client: "Pierre Martin",
      vehicule: "IJ-789-KL",
      dateEcheance: addDays(new Date(), -10).toISOString().split("T")[0],
      statut: "en cours",
      montant: 650,
      dateCreation: addDays(new Date(), -12).toISOString().split("T")[0],
      note: "Relance par email envoyée hier",
    },
    {
      id: "4",
      type: "relance devis",
      numero: "DEV-2024-003",
      client: "Marie Leroy",
      vehicule: "MN-012-OP",
      dateEcheance: addDays(new Date(), 2).toISOString().split("T")[0],
      statut: "à faire",
      montant: 450,
      dateCreation: addDays(new Date(), -3).toISOString().split("T")[0],
    },
    {
      id: "5",
      type: "relance facture",
      numero: "FAC-2024-046",
      client: "Jean Dubois",
      vehicule: "QR-345-ST",
      dateEcheance: addDays(new Date(), -15).toISOString().split("T")[0],
      statut: "reporté",
      montant: 980,
      dateCreation: addDays(new Date(), -20).toISOString().split("T")[0],
      dateReport: addDays(new Date(), 5).toISOString().split("T")[0],
      note: "Reporté de 5 jours, client en déplacement",
    },
    {
      id: "6",
      type: "relance devis",
      numero: "DEV-2024-004",
      client: "Claire Moreau",
      vehicule: "UV-678-WX",
      dateEcheance: addDays(new Date(), -1).toISOString().split("T")[0],
      statut: "fait",
      montant: 720,
      dateCreation: addDays(new Date(), -6).toISOString().split("T")[0],
      note: "Relance effectuée par téléphone",
    },
  ]);

  const filteredTaches = tachesRelances.filter((tache) => {
    const matchesSearch =
      searchQuery === "" ||
      tache.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tache.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tache.vehicule && tache.vehicule.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatut = statutFilter === "all" || tache.statut === statutFilter;
    const matchesType = typeFilter === "all" || tache.type === typeFilter;

    return matchesSearch && matchesStatut && matchesType;
  });

  const getStatutBadge = (statut: TacheRelance["statut"]) => {
    switch (statut) {
      case "à faire":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">À faire</Badge>;
      case "en cours":
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">En cours</Badge>;
      case "fait":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Fait</Badge>;
      case "reporté":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Reporté</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const getTypeBadge = (type: TacheRelance["type"]) => {
    if (type === "relance devis") {
      return (
        <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
          <FileText className="mr-1 h-3 w-3" />
          Relance devis
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
          <Receipt className="mr-1 h-3 w-3" />
          Relance facture
        </Badge>
      );
    }
  };

  const handleMarquerCommeFait = (tacheId: string) => {
    setTachesRelances((prev) =>
      prev.map((t) => (t.id === tacheId ? { ...t, statut: "fait" as const } : t))
    );
  };

  const handleReporter = (tacheId: string, jours: number) => {
    const nouvelleDate = addDays(new Date(), jours);
    setTachesRelances((prev) =>
      prev.map((t) =>
        t.id === tacheId
          ? {
              ...t,
              statut: "reporté" as const,
              dateEcheance: nouvelleDate.toISOString().split("T")[0],
              dateReport: nouvelleDate.toISOString().split("T")[0],
            }
          : t
      )
    );
    setIsReporterDialogOpen(false);
    setSelectedTache(null);
  };

  const handleAccederAuDocument = (tache: TacheRelance) => {
    if (tache.type === "relance devis") {
      navigate(`/devis?numero=${tache.numero}`);
    } else {
      navigate(`/factures?numero=${tache.numero}`);
    }
  };

  const handleOuvrirReporter = (tache: TacheRelance) => {
    setSelectedTache(tache);
    setIsReporterDialogOpen(true);
  };

  const getEcheanceColor = (dateEcheance: string) => {
    const echeance = parseISO(dateEcheance);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    if (isBefore(echeance, aujourdhui)) {
      return "text-red-600 font-semibold";
    } else if (isAfter(echeance, addDays(aujourdhui, 2))) {
      return "text-gray-600";
    } else {
      return "text-orange-600 font-medium";
    }
  };

  const tachesAFaire = filteredTaches.filter((t) => t.statut === "à faire").length;
  const tachesEnRetard = filteredTaches.filter(
    (t) => t.statut === "à faire" && isBefore(parseISO(t.dateEcheance), new Date())
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                Gestion des relances
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Tâches / Relances{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Centralisées
                </span>
              </h1>
              <p className="text-sm text-gray-600">Centralisez toutes les relances à faire</p>
            </div>
            <div className="flex items-center gap-3">
              {tachesEnRetard > 0 && (
                <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                  {tachesEnRetard} en retard
                </Badge>
              )}
              {tachesAFaire > 0 && (
                <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                  {tachesAFaire} à faire
                </Badge>
              )}
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
                    placeholder="Rechercher (n° devis/facture, client, véhicule)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="relance devis">Relance devis</SelectItem>
                    <SelectItem value="relance facture">Relance facture</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="à faire">À faire</SelectItem>
                    <SelectItem value="en cours">En cours</SelectItem>
                    <SelectItem value="fait">Fait</SelectItem>
                    <SelectItem value="reporté">Reporté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Liste des tâches */}
        <BlurFade inView delay={0.1}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Liste des tâches de relance</CardTitle>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {filteredTaches.length} tâche{filteredTaches.length > 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200/50 bg-blue-50/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">N° Devis/Facture</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Véhicule</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date d'échéance</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Montant</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTaches.map((tache) => (
                      <tr
                        key={tache.id}
                        className="border-b border-blue-100/50 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">{getTypeBadge(tache.type)}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{tache.numero}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{tache.client}</td>
                        <td className="py-3 px-4 text-gray-700">{tache.vehicule || "-"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className={getEcheanceColor(tache.dateEcheance)}>
                              {format(parseISO(tache.dateEcheance), "d MMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {tache.montant ? (
                            <span className="font-medium text-gray-900">{tache.montant.toLocaleString()} €</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4">{getStatutBadge(tache.statut)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAccederAuDocument(tache)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                              title="Accéder au devis/facture"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                            {tache.statut !== "fait" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarquerCommeFait(tache.id)}
                                  className="h-8 w-8 p-0 hover:bg-green-50"
                                  title="Marquer comme fait"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOuvrirReporter(tache)}
                                  className="h-8 w-8 p-0 hover:bg-orange-50"
                                  title="Reporter"
                                >
                                  <Calendar className="h-4 w-4 text-orange-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTaches.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-700/60">Aucune tâche de relance trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Dialog Reporter */}
        <Dialog open={isReporterDialogOpen} onOpenChange={setIsReporterDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Reporter la tâche</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                {selectedTache && (
                  <>
                    Reprogrammer la relance pour le {selectedTache.numero} ({selectedTache.client})
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedTache && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Reporter de combien de jours ?
                  </label>
                  <Select
                    value={joursReport.toString()}
                    onValueChange={(v) => setJoursReport(Number(v))}
                  >
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                      <SelectItem value="1">1 jour</SelectItem>
                      <SelectItem value="2">2 jours</SelectItem>
                      <SelectItem value="3">3 jours</SelectItem>
                      <SelectItem value="5">5 jours</SelectItem>
                      <SelectItem value="7">1 semaine</SelectItem>
                      <SelectItem value="14">2 semaines</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    Nouvelle date d'échéance :{" "}
                    {format(addDays(new Date(), joursReport), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsReporterDialogOpen(false)}
                    className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleReporter(selectedTache.id, joursReport)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reporter
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

export default Relances;
