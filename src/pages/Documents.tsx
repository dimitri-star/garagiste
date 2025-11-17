import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Download,
  Eye,
  Trash2,
  FileText,
  Image as ImageIcon,
  Mic,
  Building2,
  Calendar,
  Upload,
  Link2,
  Folder,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  BarChart3,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface Document {
  id: string;
  nom: string;
  chantier: string;
  type: "Devis" | "Facture" | "Plan" | "Note" | "Photo" | "Contrat" | "PV";
  statut: "À valider" | "Signé" | "Envoyé" | "Brouillon";
  dateAjout: string;
  taille?: string;
  extension?: string;
  commentaire?: string;
  remplace?: string;
}

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chantierFilter, setChantierFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tableau" | "chantiers">("tableau");

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      nom: "Devis_Peinture_Duval_T3.pdf",
      chantier: "Rénovation T3 – Champs-Élysées",
      type: "Devis",
      statut: "À valider",
      dateAjout: "2025-11-14",
      taille: "2.3 MB",
      extension: "pdf",
    },
    {
      id: "2",
      nom: "Note_orale_chef_11nov.m4a",
      chantier: "Résidence Les Chênes",
      type: "Note",
      statut: "Brouillon",
      dateAjout: "2025-11-11",
      taille: "1.2 MB",
      extension: "m4a",
    },
    {
      id: "3",
      nom: "Plan_archi_VillaSud.pdf",
      chantier: "Villa Agde",
      type: "Plan",
      statut: "Signé",
      dateAjout: "2025-10-29",
      taille: "5.8 MB",
      extension: "pdf",
    },
    {
      id: "4",
      nom: "Facture_ÉlecOuest_oct.pdf",
      chantier: "Studio République",
      type: "Facture",
      statut: "Signé",
      dateAjout: "2025-11-10",
      taille: "856 KB",
      extension: "pdf",
    },
    {
      id: "5",
      nom: "Photo_chantier_Béziers_01.jpg",
      chantier: "Rénovation Béziers Centre",
      type: "Photo",
      statut: "Envoyé",
      dateAjout: "2025-11-13",
      taille: "3.4 MB",
      extension: "jpg",
    },
    {
      id: "6",
      nom: "Contrat_Plomberie_Duval.pdf",
      chantier: "Rénovation T3 – Champs-Élysées",
      type: "Contrat",
      statut: "Signé",
      dateAjout: "2025-11-01",
      taille: "1.1 MB",
      extension: "pdf",
    },
    {
      id: "7",
      nom: "PV_Reception_Box_Est.pdf",
      chantier: "Box Stockage ZI Est",
      type: "PV",
      statut: "Signé",
      dateAjout: "2025-11-05",
      taille: "2.7 MB",
      extension: "pdf",
    },
    {
      id: "8",
      nom: "Devis_Menuiserie_Concept.pdf",
      chantier: "Résidence Les Chênes",
      type: "Devis",
      statut: "À valider",
      dateAjout: "2025-11-12",
      taille: "1.9 MB",
      extension: "pdf",
    },
    {
      id: "9",
      nom: "Facture_GrosOeuvre_Narbonne.pdf",
      chantier: "Programme Neuf Narbonne",
      type: "Facture",
      statut: "Signé",
      dateAjout: "2025-11-08",
      taille: "2.1 MB",
      extension: "pdf",
    },
    {
      id: "10",
      nom: "Plan_archi_Studio_Rep.pdf",
      chantier: "Studio République",
      type: "Plan",
      statut: "Signé",
      dateAjout: "2025-10-25",
      taille: "4.2 MB",
      extension: "pdf",
    },
  ]);

  const chantiers = Array.from(new Set(documents.map((d) => d.chantier)));

  // Statistiques
  const totalDocuments = documents.length;
  const documentsAValider = documents.filter((d) => d.statut === "À valider").length;
  const documentsSignes = documents.filter((d) => d.statut === "Signé").length;
  const documentsParType = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getTypeIcon = (type: string, extension?: string) => {
    if (extension === "jpg" || extension === "png" || extension === "jpeg" || type === "Photo") {
      return <ImageIcon className="h-5 w-5 text-blue-400" />;
    }
    if (extension === "m4a" || extension === "mp3" || extension === "wav" || type === "Note") {
      return <Mic className="h-5 w-5 text-purple-400" />;
    }
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Devis":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Devis</Badge>;
      case "Facture":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Facture</Badge>;
      case "Plan":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Plan</Badge>;
      case "Note":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Note</Badge>;
      case "Photo":
        return <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">Photo</Badge>;
      case "Contrat":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Contrat</Badge>;
      case "PV":
        return <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">PV</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "Signé":
      case "Signée":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Signé</Badge>;
      case "À valider":
        return <Badge className="bg-red-500/20 text-blue-600 border-blue-300/50">À valider</Badge>;
      case "Envoyé":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Envoyé</Badge>;
      case "Brouillon":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Brouillon</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.chantier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChantier = chantierFilter === "all" || doc.chantier === chantierFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesStatut = statutFilter === "all" || doc.statut === statutFilter;

    return matchesSearch && matchesChantier && matchesType && matchesStatut;
  });

  const documentsParChantier = chantiers.reduce((acc, chantier) => {
    acc[chantier] = documents.filter((d) => d.chantier === chantier);
    return acc;
  }, {} as Record<string, Document[]>);

  const handleDelete = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                Gestion documentaire
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Documents
                </span>
              </h1>
              <p className="text-sm text-gray-600">
                Tous les fichiers, plans, devis, photos et factures de vos chantiers, réunis ici.
              </p>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un document
            </Button>
          </div>
        </BlurFade>

        {/* Statistiques */}
        <BlurFade inView delay={0.05}>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700/70 mb-1">Total documents</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700/70 mb-1">À valider</p>
                    <p className="text-2xl font-bold text-blue-600">{documentsAValider}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700/70 mb-1">Signés</p>
                    <p className="text-2xl font-bold text-green-400">{documentsSignes}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700/70 mb-1">Chantiers</p>
                    <p className="text-2xl font-bold text-gray-900">{chantiers.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </BlurFade>

        {/* Filtres */}
        <BlurFade inView delay={0.1}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600/60" />
                  <Input
                    placeholder="Rechercher (nom fichier, chantier, prestataire)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-700 placeholder:text-blue-600/50 focus:border-blue-500"
                  />
                </div>
                <Select value={chantierFilter} onValueChange={setChantierFilter}>
                  <SelectTrigger className="w-full md:w-[200px] bg-white border-blue-300/50 text-gray-700">
                    <SelectValue placeholder="Tous les chantiers" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les chantiers</SelectItem>
                    {chantiers.map((chantier) => (
                      <SelectItem key={chantier} value={chantier}>
                        {chantier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-700">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Devis">Devis</SelectItem>
                    <SelectItem value="Facture">Facture</SelectItem>
                    <SelectItem value="Plan">Plan</SelectItem>
                    <SelectItem value="Note">Note</SelectItem>
                    <SelectItem value="Photo">Photo</SelectItem>
                    <SelectItem value="Contrat">Contrat</SelectItem>
                    <SelectItem value="PV">PV</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-700">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="À valider">À valider</SelectItem>
                    <SelectItem value="Signé">Signé</SelectItem>
                    <SelectItem value="Envoyé">Envoyé</SelectItem>
                    <SelectItem value="Brouillon">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Onglets Vue Tableau / Vue Chantiers */}
        <BlurFade inView delay={0.15}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "tableau" | "chantiers")}>
            <TabsList className="bg-white border-blue-200/50">
              <TabsTrigger value="tableau" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <BarChart3 className="mr-2 h-4 w-4" />
                Vue tableau
              </TabsTrigger>
              <TabsTrigger value="chantiers" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <Folder className="mr-2 h-4 w-4" />
                Vue par chantier
              </TabsTrigger>
            </TabsList>

            {/* Vue Tableau */}
            <TabsContent value="tableau" className="mt-4">
              <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">Tous les documents</CardTitle>
                    <Badge className="bg-red-500/20 text-blue-600 border-blue-300/50">
                      {filteredDocuments.length} document{filteredDocuments.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-blue-200/50 bg-red-950/20">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom du document</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Chantier</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Ajouté le</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((doc) => (
                          <tr
                            key={doc.id}
                            className="border-b border-blue-100/50 hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {getTypeIcon(doc.type, doc.extension)}
                                <div>
                                  <p className="font-medium text-gray-900">{doc.nom}</p>
                                  {doc.taille && (
                                    <p className="text-xs text-blue-600/60">{doc.taille}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-gray-700/80">
                                <Building2 className="h-4 w-4 text-blue-600" />
                                <span>{doc.chantier}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{getTypeBadge(doc.type)}</td>
                            <td className="py-3 px-4">{getStatutBadge(doc.statut)}</td>
                            <td className="py-3 px-4 text-gray-700/80">
                              {format(parseISO(doc.dateAjout), "d MMM yyyy", { locale: fr })}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-600"
                                  title="Voir"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-600"
                                  title="Télécharger"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-gray-9000"
                                  onClick={() => handleDelete(doc.id)}
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-600"
                                  title="Associer"
                                >
                                  <Link2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredDocuments.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-blue-600/30 mx-auto mb-3" />
                        <p className="text-gray-700/60">Aucun document trouvé</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vue par Chantier */}
            <TabsContent value="chantiers" className="mt-4">
              <div className="space-y-6">
                {Object.entries(documentsParChantier).map(([chantier, docs]) => {
                  const docsFiltered = docs.filter((doc) => {
                    const matchesSearch =
                      doc.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.chantier.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesType = typeFilter === "all" || doc.type === typeFilter;
                    const matchesStatut = statutFilter === "all" || doc.statut === statutFilter;
                    return matchesSearch && matchesType && matchesStatut;
                  });

                  if (docsFiltered.length === 0 && (searchQuery || typeFilter !== "all" || statutFilter !== "all")) {
                    return null;
                  }

                  return (
                    <Card
                      key={chantier}
                      className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-gray-900">{chantier}</CardTitle>
                          </div>
                          <Badge className="bg-red-500/20 text-blue-600 border-blue-300/50">
                            {docsFiltered.length} document{docsFiltered.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {docsFiltered.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-red-950/20 rounded-lg border border-blue-200/50 hover:border-red-500/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {getTypeIcon(doc.type, doc.extension)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-gray-900">{doc.nom}</p>
                                    {getTypeBadge(doc.type)}
                                    {getStatutBadge(doc.statut)}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-blue-600/60">
                                    <span>{format(parseISO(doc.dateAjout), "d MMM yyyy", { locale: fr })}</span>
                                    {doc.taille && <span>{doc.taille}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-600"
                                  title="Voir"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-600"
                                  title="Télécharger"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-gray-9000"
                                  onClick={() => handleDelete(doc.id)}
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {Object.keys(documentsParChantier).length === 0 && (
                  <div className="text-center py-12">
                    <Folder className="h-12 w-12 text-blue-600/30 mx-auto mb-3" />
                    <p className="text-gray-700/60">Aucun chantier trouvé</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </BlurFade>

        {/* Dialog Ajouter un document */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Ajouter un document</DialogTitle>
              <DialogDescription className="text-gray-700/70">
                Téléversez un fichier et associez-le à un chantier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700/80 mb-2 block">
                  Fichier
                </label>
                <div className="border-2 border-dashed border-blue-300/50 rounded-lg p-8 text-center hover:border-red-500/50 transition-colors">
                  <Upload className="h-12 w-12 text-blue-600/50 mx-auto mb-3" />
                  <p className="text-sm text-gray-700/70 mb-2">
                    Glissez-déposez un fichier ici ou cliquez pour sélectionner
                  </p>
                  <Button
                    variant="outline"
                    className="border-blue-300/50 text-gray-700 hover:bg-blue-50"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choisir un fichier
                  </Button>
                </div>
              </div>

              {/* Chantier */}
              <div>
                <label className="text-sm font-medium text-gray-700/80 mb-2 block">
                  Associer à un chantier
                </label>
                <Select>
                  <SelectTrigger className="bg-white border-blue-300/50 text-gray-700">
                    <SelectValue placeholder="Sélectionner un chantier" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    {chantiers.map((chantier) => (
                      <SelectItem key={chantier} value={chantier}>
                        {chantier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-gray-700/80 mb-2 block">
                  Type de document
                </label>
                <Select>
                  <SelectTrigger className="bg-white border-blue-300/50 text-gray-700">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="Devis">Devis</SelectItem>
                    <SelectItem value="Facture">Facture</SelectItem>
                    <SelectItem value="Plan">Plan</SelectItem>
                    <SelectItem value="Note">Note</SelectItem>
                    <SelectItem value="Photo">Photo</SelectItem>
                    <SelectItem value="Contrat">Contrat</SelectItem>
                    <SelectItem value="PV">PV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags (optionnel) */}
              <div>
                <label className="text-sm font-medium text-gray-700/80 mb-2 block">
                  Tags personnalisés (optionnel)
                </label>
                <Input
                  placeholder="Ex: urgent, validation, etc."
                  className="bg-white border-blue-300/50 text-gray-700 placeholder:text-blue-600/50"
                />
              </div>

              {/* Commentaire */}
              <div>
                <label className="text-sm font-medium text-gray-700/80 mb-2 block">
                  Commentaire / note interne
                </label>
                <Textarea
                  placeholder="Ajoutez une note sur ce document..."
                  className="bg-white border-blue-300/50 text-gray-700 placeholder:text-blue-600/50 min-h-[100px]"
                />
              </div>

              {/* Remplace un document */}
              <div className="flex items-center gap-2 pt-2 border-t border-blue-200/50">
                <Switch className="data-[state=checked]:bg-red-500" />
                <span className="text-sm text-gray-700/70">
                  Ce document remplace un précédent ?
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => setIsAddDialogOpen(false)}
                  variant="outline"
                  className="border-blue-300/50 text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => setIsAddDialogOpen(false)}
                  className="bg-red-500 hover:bg-red-600 text-gray-900"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Ajouter le document
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
