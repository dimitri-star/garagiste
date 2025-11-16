import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  RefreshCw,
  Calendar,
  Bell,
  Building2,
  Target,
  Send,
  Eye,
  Settings,
  Zap,
  GripVertical,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface Relance {
  id: string;
  prestataire: string;
  chantier: string;
  echeance: string;
  canal: "Email" | "Appel" | "SMS";
  sujet: string;
  statut: "À faire" | "Relancée" | "Sans réponse" | "En attente";
  datePrevue: string;
  automatisee: boolean;
  resultat?: "Répondu" | "Sans réponse" | "En attente";
}

const Relances = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedRelance, setSelectedRelance] = useState<Relance | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [draggedRelanceId, setDraggedRelanceId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [relancesAujourdhui, setRelancesAujourdhui] = useState<Relance[]>([
    {
      id: "1",
      prestataire: "SARL BatiPro – Électricien",
      chantier: "Appart T4 – Paris 10",
      echeance: "Intervention prévue le 18 nov",
      canal: "Email",
      sujet: "Confirmation d'arrivée chantier",
      statut: "À faire",
      datePrevue: new Date().toISOString().split("T")[0],
      automatisee: false,
    },
    {
      id: "2",
      prestataire: "Plomberie Duval",
      chantier: "Rénovation T3 – Champs-Élysées",
      echeance: "Devis à signer avant le 20 nov",
      canal: "Appel",
      sujet: "Relance devis en attente",
      statut: "À faire",
      datePrevue: new Date().toISOString().split("T")[0],
      automatisee: true,
    },
    {
      id: "3",
      prestataire: "Menuiserie Concept",
      chantier: "Résidence Les Chênes",
      echeance: "Point avancement demandé",
      canal: "SMS",
      sujet: "Demande point situation",
      statut: "À faire",
      datePrevue: new Date().toISOString().split("T")[0],
      automatisee: false,
    },
  ]);

  const [relancesPlanning, setRelancesPlanning] = useState<Relance[]>([
    {
      id: "4",
      prestataire: "Gros Œuvre Biterrois",
      chantier: "Programme Neuf Narbonne",
      echeance: "Intervention prévue le 19 nov",
      canal: "Email",
      sujet: "Confirmation planning",
      statut: "À faire",
      datePrevue: addDays(new Date(), 1).toISOString().split("T")[0],
      automatisee: true,
    },
    {
      id: "5",
      prestataire: "Peinture & Déco 34",
      chantier: "Résidence Les Chênes",
      echeance: "Relance facture",
      canal: "Appel",
      sujet: "Facture en attente",
      statut: "À faire",
      datePrevue: addDays(new Date(), 2).toISOString().split("T")[0],
      automatisee: false,
    },
    {
      id: "6",
      prestataire: "Carrelage Sud",
      chantier: "Rénovation Béziers Centre",
      echeance: "Point technique",
      canal: "SMS",
      sujet: "Question technique",
      statut: "À faire",
      datePrevue: addDays(new Date(), 3).toISOString().split("T")[0],
      automatisee: true,
    },
  ]);

  const [crmPrestataires, setCrmPrestataires] = useState([
    {
      id: "crm1",
      nom: "Plomberie Duval",
      telephone: "06 00 00 00 00",
      email: "contact@duvalpro.fr",
      chantier: "Rénovation T3 – Champs-Élysées",
      type: "Plomberie",
      statut: "À relancer",
      derniereRelance: addDays(new Date(), -2).toISOString().split("T")[0],
      canal: "Email",
      automatisee: true,
      resultat: "Sans réponse",
    },
    {
      id: "crm2",
      nom: "Élec Ouest",
      telephone: "06 11 11 11 11",
      email: "info@elec-ouest.fr",
      chantier: "Studio République",
      type: "Électricité",
      statut: "Actif",
      derniereRelance: addDays(new Date(), -1).toISOString().split("T")[0],
      canal: "Appel",
      automatisee: false,
      resultat: "Répondu",
    },
    {
      id: "crm3",
      nom: "Menuiserie Concept",
      telephone: "06 22 22 22 22",
      email: "contact@menuiserie-concept.fr",
      chantier: "Résidence Les Chênes",
      type: "Menuiserie",
      statut: "En attente",
      derniereRelance: addDays(new Date(), -3).toISOString().split("T")[0],
      canal: "SMS",
      automatisee: true,
      resultat: "En attente",
    },
    {
      id: "crm4",
      nom: "Gros Œuvre Biterrois",
      telephone: "06 33 33 33 33",
      email: "info@gros-oeuvre-34.fr",
      chantier: "Programme Neuf Narbonne",
      type: "Gros œuvre",
      statut: "Actif",
      derniereRelance: addDays(new Date(), -5).toISOString().split("T")[0],
      canal: "Email",
      automatisee: true,
      resultat: "Répondu",
    },
    {
      id: "crm5",
      nom: "Peinture & Déco 34",
      telephone: "06 44 44 44 44",
      email: "contact@peinture-deco-34.fr",
      chantier: "Résidence Les Chênes",
      type: "Peinture",
      statut: "À relancer",
      derniereRelance: addDays(new Date(), -4).toISOString().split("T")[0],
      canal: "Email",
      automatisee: false,
      resultat: "Sans réponse",
    },
    {
      id: "crm6",
      nom: "Carrelage Sud",
      telephone: "06 55 55 55 55",
      email: "info@carrelage-sud.fr",
      chantier: "Rénovation Béziers Centre",
      type: "Carrelage",
      statut: "Actif",
      derniereRelance: addDays(new Date(), -1).toISOString().split("T")[0],
      canal: "SMS",
      automatisee: true,
      resultat: "Répondu",
    },
  ]);

  const [crmSearchQuery, setCrmSearchQuery] = useState("");
  const [crmStatutFilter, setCrmStatutFilter] = useState<string>("all");
  const [crmTypeFilter, setCrmTypeFilter] = useState<string>("all");

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case "Email":
        return <Mail className="h-4 w-4 text-red-400" />;
      case "Appel":
        return <Phone className="h-4 w-4 text-orange-400" />;
      case "SMS":
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getResultatBadge = (resultat?: string) => {
    switch (resultat) {
      case "Répondu":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Répondu</Badge>;
      case "Sans réponse":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Sans réponse</Badge>;
      case "En attente":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">En attente</Badge>;
      default:
        return null;
    }
  };

  const getInitiales = (nom: string) => {
    return nom
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatutBadgeCRM = (statut: string) => {
    switch (statut) {
      case "Actif":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Actif</Badge>;
      case "À relancer":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">À relancer</Badge>;
      case "En attente":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">En attente</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const filteredCrmPrestataires = crmPrestataires.filter((prestataire) => {
    const matchesSearch =
      prestataire.nom.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
      prestataire.email.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
      prestataire.telephone.includes(crmSearchQuery);
    const matchesStatut = crmStatutFilter === "all" || prestataire.statut === crmStatutFilter;
    const matchesType = crmTypeFilter === "all" || prestataire.type === crmTypeFilter;

    return matchesSearch && matchesStatut && matchesType;
  });

  const handleEnvoyer = (relanceId: string) => {
    setRelancesAujourdhui((prev) =>
      prev.map((r) => (r.id === relanceId ? { ...r, statut: "Relancée" as const } : r))
    );
    // Déplacer vers l'historique
    const relance = relancesAujourdhui.find((r) => r.id === relanceId);
    if (relance) {
      setHistoriqueRelances((prev) => [
        { ...relance, statut: "Relancée" as const, datePrevue: new Date().toISOString().split("T")[0] },
        ...prev,
      ]);
      setRelancesAujourdhui((prev) => prev.filter((r) => r.id !== relanceId));
    }
  };

  const toggleAutomatisation = (relanceId: string) => {
    setRelancesAujourdhui((prev) =>
      prev.map((r) => (r.id === relanceId ? { ...r, automatisee: !r.automatisee } : r))
    );
    // Déclencher webhook Make si activé
    const relance = relancesAujourdhui.find((r) => r.id === relanceId);
    if (relance && !relance.automatisee) {
      console.log("Déclenchement webhook Make pour:", relance);
      // Ici on appellerait l'API Make
    }
  };

  const handleDragStart = (relanceId: string) => {
    setDraggedRelanceId(relanceId);
  };

  const handleDragOver = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    setSelectedDay(day);
  };

  const handleDrop = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    if (draggedRelanceId) {
      setRelancesPlanning((prev) =>
        prev.map((r) => (r.id === draggedRelanceId ? { ...r, datePrevue: day } : r))
      );
      setDraggedRelanceId(null);
      setSelectedDay(null);
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getRelancesForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return relancesPlanning.filter((r) => r.datePrevue === dayStr);
  };

  const handleOpenDetail = (relance: Relance) => {
    setSelectedRelance(relance);
    setIsDetailDialogOpen(true);
  };

  const relancesUrgentes = relancesAujourdhui.filter((r) => r.statut === "À faire").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 text-red-50">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-300">
                Gestion des relances
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Relances{" "}
                <span className="bg-gradient-to-r from-red-200 via-red-400 to-red-300 bg-clip-text text-transparent">
                  Prestataires
                </span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-sm text-red-100/80">
                  Centralisez, tracez et automatisez toutes vos relances intervenants.
                </p>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  {relancesUrgentes} relances urgentes à faire
                </Badge>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une relance manuelle
            </Button>
          </div>
        </BlurFade>

        {/* Bloc "À relancer aujourd'hui" */}
        <BlurFade inView delay={0.05}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-400" />
              <h2 className="text-xl font-semibold text-white">À relancer aujourd'hui</h2>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {relancesAujourdhui.filter((r) => r.statut === "À faire").length}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relancesAujourdhui
                .filter((r) => r.statut === "À faire")
                .map((relance) => (
                  <Card
                    key={relance.id}
                    className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group"
                  >
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">{relance.prestataire}</h3>
                            <div className="flex items-center gap-2 text-sm text-red-200/80 mb-2">
                              <Building2 className="h-4 w-4 text-red-400" />
                              <span>{relance.chantier}</span>
                            </div>
                          </div>
                          {getCanalIcon(relance.canal)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-red-200/70">
                            <Clock className="h-4 w-4 text-red-400" />
                            <span>{relance.echeance}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-red-200/80">
                            <Target className="h-4 w-4 text-red-400" />
                            <span className="font-medium">{relance.sujet}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-red-900/30">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={relance.automatisee}
                              onCheckedChange={() => toggleAutomatisation(relance.id)}
                              className="data-[state=checked]:bg-red-500"
                            />
                            <span className="text-xs text-red-300/60">
                              {relance.automatisee ? "✓ Automatisé" : "Automatiser"}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleEnvoyer(relance.id)}
                            className="bg-red-500/20 border-red-500/30 text-red-100 hover:bg-red-500/30"
                            variant="outline"
                            size="sm"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer maintenant
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </BlurFade>

        {/* Bloc "Planning des relances" */}
        <BlurFade inView delay={0.1}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Planning des relances</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                  variant="ghost"
                  size="sm"
                  className="text-red-100 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-red-200/80 min-w-[200px] text-center">
                  {format(weekStart, "d MMM", { locale: fr })} -{" "}
                  {format(addDays(weekStart, 6), "d MMM yyyy", { locale: fr })}
                </span>
                <Button
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                  variant="ghost"
                  size="sm"
                  className="text-red-100 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <div className="flex gap-2 min-w-[800px]">
                    {weekDays.map((day) => {
                      const dayStr = format(day, "yyyy-MM-dd");
                      const isToday = isSameDay(day, new Date());
                      const relancesDay = getRelancesForDay(day);

                      return (
                        <div
                          key={dayStr}
                          className={`flex-1 min-w-[140px] p-3 rounded-lg border ${
                            isToday
                              ? "border-red-500/50 bg-red-950/20"
                              : "border-red-900/30 bg-red-950/10"
                          } ${selectedDay === dayStr ? "border-red-500/70 bg-red-950/30" : ""}`}
                          onDragOver={(e) => handleDragOver(e, dayStr)}
                          onDrop={(e) => handleDrop(e, dayStr)}
                        >
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-red-300/60 uppercase">
                              {format(day, "EEE", { locale: fr })}
                            </p>
                            <p className={`text-lg font-bold ${isToday ? "text-red-400" : "text-white"}`}>
                              {format(day, "d", { locale: fr })}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {relancesDay.map((relance) => (
                              <motion.div
                                key={relance.id}
                                draggable
                                onDragStart={() => handleDragStart(relance.id)}
                                whileHover={{ scale: 1.02 }}
                                whileDrag={{ opacity: 0.5 }}
                                onClick={() => handleOpenDetail(relance)}
                                className="p-2 bg-black/40 rounded border border-red-900/30 hover:border-red-500/50 cursor-move transition-colors"
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  {getCanalIcon(relance.canal)}
                                  <span className="text-xs font-medium text-white truncate">
                                    {relance.prestataire.split("–")[0].trim()}
                                  </span>
                                </div>
                                <p className="text-xs text-red-200/70 truncate">{relance.sujet}</p>
                                {relance.automatisee && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] mt-1">
                                    Auto
                                  </Badge>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </BlurFade>

        {/* Bloc CRM Prestataires */}
        <BlurFade inView delay={0.15}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-400" />
                CRM Prestataires
              </h2>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {filteredCrmPrestataires.length} prestataires dans le CRM
              </Badge>
            </div>

            {/* Filtres CRM */}
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-300/60" />
                    <Input
                      placeholder="Rechercher un prestataire..."
                      value={crmSearchQuery}
                      onChange={(e) => setCrmSearchQuery(e.target.value)}
                      className="pl-10 bg-black/40 border-red-500/30 text-red-100 placeholder:text-red-300/50 focus:border-red-400"
                    />
                  </div>
                  <Select value={crmStatutFilter} onValueChange={setCrmStatutFilter}>
                    <SelectTrigger className="w-full md:w-[180px] bg-black/40 border-red-500/30 text-red-100">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-red-900/40 text-red-100">
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="À relancer">À relancer</SelectItem>
                      <SelectItem value="En attente">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={crmTypeFilter} onValueChange={setCrmTypeFilter}>
                    <SelectTrigger className="w-full md:w-[180px] bg-black/40 border-red-500/30 text-red-100">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-red-900/40 text-red-100">
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="Plomberie">Plomberie</SelectItem>
                      <SelectItem value="Électricité">Électricité</SelectItem>
                      <SelectItem value="Menuiserie">Menuiserie</SelectItem>
                      <SelectItem value="Gros œuvre">Gros œuvre</SelectItem>
                      <SelectItem value="Peinture">Peinture</SelectItem>
                      <SelectItem value="Carrelage">Carrelage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tableau CRM */}
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-red-900/30 bg-red-950/20">
                        <th className="text-left py-3 px-4 font-semibold text-red-200">
                          <input type="checkbox" className="rounded border-red-500/30" />
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-red-200">NOM</th>
                        <th className="text-left py-3 px-4 font-semibold text-red-200">TÉLÉPHONE</th>
                        <th className="text-left py-3 px-4 font-semibold text-red-200">EMAIL</th>
                        <th className="text-left py-3 px-4 font-semibold text-red-200">CHANTIER</th>
                        <th className="text-left py-3 px-4 font-semibold text-red-200">TYPE</th>
                        <th className="text-left py-3 px-4 font-semibold text-red-200">STATUT</th>
                        <th className="text-left py-3 px-4 font-semibold text-red-200">DERNIÈRE RELANCE</th>
                        <th className="text-left py-3 px-4 font-semibold text-red-200">AUTOMATISÉE</th>
                        <th className="text-left py-3 px-4 font-semibold text-red-200">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCrmPrestataires.map((prestataire) => (
                        <tr
                          key={prestataire.id}
                          className="border-b border-red-900/20 hover:bg-red-950/20 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <input type="checkbox" className="rounded border-red-500/30" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                <span className="text-sm font-semibold text-red-400">
                                  {getInitiales(prestataire.nom)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-white">{prestataire.nom}</p>
                                <p className="text-xs text-red-300/60">Non renseigné</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-red-200/80">{prestataire.telephone}</td>
                          <td className="py-3 px-4 text-red-200/80">{prestataire.email}</td>
                          <td className="py-3 px-4 text-red-200/80">{prestataire.chantier}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              {prestataire.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{getStatutBadgeCRM(prestataire.statut)}</td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <p className="text-xs text-red-200/80">
                                {format(parseISO(prestataire.derniereRelance), "d MMM yyyy", { locale: fr })}
                              </p>
                              <div className="flex items-center gap-1">
                                {getCanalIcon(prestataire.canal)}
                                <span className="text-xs text-red-300/60">{prestataire.canal}</span>
                              </div>
                              {getResultatBadge(prestataire.resultat)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {prestataire.automatisee ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Oui</Badge>
                            ) : (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Non</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              className="bg-red-500/10 border-red-500/30 text-red-100 hover:bg-red-500/20"
                              variant="outline"
                              size="sm"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Relancer
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredCrmPrestataires.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-red-200/60">Aucun prestataire trouvé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </BlurFade>

        {/* Dialog Détail relance */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-black/95 border-red-900/40 text-red-50 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Détail de la relance</DialogTitle>
              <DialogDescription className="text-red-200/70">
                Modifiez les paramètres de cette relance
              </DialogDescription>
            </DialogHeader>
            {selectedRelance && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-red-200/80 mb-2 block">Prestataire</label>
                    <Input
                      value={selectedRelance.prestataire}
                      className="bg-black/40 border-red-500/30 text-red-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-200/80 mb-2 block">Chantier</label>
                    <Input
                      value={selectedRelance.chantier}
                      className="bg-black/40 border-red-500/30 text-red-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-200/80 mb-2 block">Canal</label>
                    <Select defaultValue={selectedRelance.canal}>
                      <SelectTrigger className="bg-black/40 border-red-500/30 text-red-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-red-900/40 text-red-100">
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Appel">Appel</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-200/80 mb-2 block">Sujet</label>
                    <Input
                      value={selectedRelance.sujet}
                      className="bg-black/40 border-red-500/30 text-red-100"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-red-900/30">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedRelance.automatisee}
                      className="data-[state=checked]:bg-red-500"
                    />
                    <span className="text-sm text-red-200/70">Automatiser cette relance</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsDetailDialogOpen(false)}
                      variant="outline"
                      className="border-red-500/30 text-red-100 hover:bg-red-500/10"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={() => {
                        handleEnvoyer(selectedRelance.id);
                        setIsDetailDialogOpen(false);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Relancer immédiatement
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

export default Relances;
