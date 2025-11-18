import { useState, useMemo } from "react";
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
  Wrench,
  Package,
  Edit,
  Archive,
  Copy,
  Euro,
  Clock,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";

interface Prestation {
  id: string;
  libelle: string;
  tempsEstime: number; // en heures
  prixMainOeuvre?: number; // prix fixe
  tauxHoraire?: number; // si taux horaire utilisé
  categorie: string;
  statut: "actif" | "archivé";
}

interface Piece {
  id: string;
  reference: string;
  libelle: string;
  prixAchat: number;
  coefficient: number;
  prixVente: number;
  stock?: number; // V2
  statut: "actif" | "archivé";
}

const Catalogue = () => {
  const [activeTab, setActiveTab] = useState<"prestations" | "pieces">("prestations");
  const [searchQuery, setSearchQuery] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string>("all");
  const [selectedPrestation, setSelectedPrestation] = useState<Prestation | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // États pour le formulaire d'édition dans le Sheet
  const [formLibelle, setFormLibelle] = useState("");
  const [formTempsEstime, setFormTempsEstime] = useState(0);
  const [formCategorie, setFormCategorie] = useState("");
  const [formTypeTarification, setFormTypeTarification] = useState<"fixe" | "horaire">("fixe");
  const [formPrixMainOeuvre, setFormPrixMainOeuvre] = useState<number | undefined>(undefined);
  const [formTauxHoraire, setFormTauxHoraire] = useState<number | undefined>(undefined);

  // États pour les pièces
  const [formReference, setFormReference] = useState("");
  const [formPrixAchat, setFormPrixAchat] = useState(0);
  const [formCoefficient, setFormCoefficient] = useState(2);
  const [formPrixVente, setFormPrixVente] = useState(0);
  const [autoCalculatePrix, setAutoCalculatePrix] = useState(true);

  const [prestations, setPrestations] = useState<Prestation[]>([
    {
      id: "1",
      libelle: "Vidange moteur",
      tempsEstime: 0.5,
      prixMainOeuvre: 45,
      categorie: "Entretien",
      statut: "actif",
    },
    {
      id: "2",
      libelle: "Remplacement courroie de distribution",
      tempsEstime: 2,
      tauxHoraire: 90,
      categorie: "Moteur",
      statut: "actif",
    },
    {
      id: "3",
      libelle: "Remplacement plaquettes de frein avant",
      tempsEstime: 1,
      prixMainOeuvre: 80,
      categorie: "Freinage",
      statut: "actif",
    },
    {
      id: "4",
      libelle: "Révision complète",
      tempsEstime: 1.5,
      prixMainOeuvre: 120,
      categorie: "Entretien",
      statut: "actif",
    },
  ]);

  const [pieces, setPieces] = useState<Piece[]>([
    {
      id: "1",
      reference: "FIL-123",
      libelle: "Filtre à huile",
      prixAchat: 8,
      coefficient: 2.5,
      prixVente: 20,
      statut: "actif",
    },
    {
      id: "2",
      reference: "CRB-456",
      libelle: "Courroie distribution",
      prixAchat: 45,
      coefficient: 2,
      prixVente: 90,
      statut: "actif",
    },
    {
      id: "3",
      reference: "PLQ-789",
      libelle: "Plaquettes frein avant",
      prixAchat: 25,
      coefficient: 2.5,
      prixVente: 62.5,
      statut: "actif",
    },
    {
      id: "4",
      reference: "HUI-012",
      libelle: "Huile moteur 5W30",
      prixAchat: 35,
      coefficient: 1.8,
      prixVente: 63,
      statut: "actif",
    },
  ]);

  // Catégories uniques pour les filtres
  const categories = useMemo(() => {
    return Array.from(new Set(prestations.map((p) => p.categorie))).filter(Boolean);
  }, [prestations]);

  const filteredPrestations = useMemo(() => {
    return prestations.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categorie.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategorie = categorieFilter === "all" || p.categorie === categorieFilter;
      const isActive = p.statut === "actif";
      return matchesSearch && matchesCategorie && isActive;
    });
  }, [prestations, searchQuery, categorieFilter]);

  const filteredPieces = useMemo(() => {
    return pieces.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchQuery.toLowerCase());
      const isActive = p.statut === "actif";
      return matchesSearch && isActive;
    });
  }, [pieces, searchQuery]);

  const handleOpenPrestation = (prestation: Prestation) => {
    setSelectedPrestation(prestation);
    setSelectedPiece(null);
    setFormLibelle(prestation.libelle);
    setFormTempsEstime(prestation.tempsEstime);
    setFormCategorie(prestation.categorie);
    setFormTypeTarification(prestation.prixMainOeuvre ? "fixe" : "horaire");
    setFormPrixMainOeuvre(prestation.prixMainOeuvre);
    setFormTauxHoraire(prestation.tauxHoraire);
    setIsCreating(false);
    setIsDetailSheetOpen(true);
  };

  const handleOpenPiece = (piece: Piece) => {
    setSelectedPiece(piece);
    setSelectedPrestation(null);
    setFormReference(piece.reference);
    setFormLibelle(piece.libelle);
    setFormPrixAchat(piece.prixAchat);
    setFormCoefficient(piece.coefficient);
    setFormPrixVente(piece.prixVente);
    setIsCreating(false);
    setIsDetailSheetOpen(true);
  };

  const handleNouvellePrestation = () => {
    setSelectedPrestation(null);
    setSelectedPiece(null);
    setFormLibelle("");
    setFormTempsEstime(0);
    setFormCategorie("");
    setFormTypeTarification("fixe");
    setFormPrixMainOeuvre(undefined);
    setFormTauxHoraire(undefined);
    setIsCreating(true);
    setIsDetailSheetOpen(true);
  };

  const handleNouvellePiece = () => {
    setSelectedPiece(null);
    setSelectedPrestation(null);
    setFormReference("");
    setFormLibelle("");
    setFormPrixAchat(0);
    setFormCoefficient(2);
    setFormPrixVente(0);
    setIsCreating(true);
    setIsDetailSheetOpen(true);
  };

  const handleSauvegarder = () => {
    if (activeTab === "prestations") {
      if (isCreating) {
        const nouvellePrestation: Prestation = {
          id: `prestation-${Date.now()}`,
          libelle: formLibelle,
          tempsEstime: formTempsEstime,
          categorie: formCategorie,
          statut: "actif",
          ...(formTypeTarification === "fixe"
            ? { prixMainOeuvre: formPrixMainOeuvre }
            : { tauxHoraire: formTauxHoraire }),
        };
        setPrestations([...prestations, nouvellePrestation]);
      } else if (selectedPrestation) {
        setPrestations(
          prestations.map((p) =>
            p.id === selectedPrestation.id
              ? {
                  ...p,
                  libelle: formLibelle,
                  tempsEstime: formTempsEstime,
                  categorie: formCategorie,
                  ...(formTypeTarification === "fixe"
                    ? { prixMainOeuvre: formPrixMainOeuvre, tauxHoraire: undefined }
                    : { tauxHoraire: formTauxHoraire, prixMainOeuvre: undefined }),
                }
              : p
          )
        );
      }
    } else {
      if (isCreating) {
        const nouvellePiece: Piece = {
          id: `piece-${Date.now()}`,
          reference: formReference,
          libelle: formLibelle,
          prixAchat: formPrixAchat,
          coefficient: formCoefficient,
          prixVente: autoCalculatePrix ? formPrixAchat * formCoefficient : formPrixVente,
          statut: "actif",
        };
        setPieces([...pieces, nouvellePiece]);
      } else if (selectedPiece) {
        setPieces(
          pieces.map((p) =>
            p.id === selectedPiece.id
              ? {
                  ...p,
                  reference: formReference,
                  libelle: formLibelle,
                  prixAchat: formPrixAchat,
                  coefficient: formCoefficient,
                  prixVente: autoCalculatePrix ? formPrixAchat * formCoefficient : formPrixVente,
                }
              : p
          )
        );
      }
    }
    setIsDetailSheetOpen(false);
  };

  const handleDupliquerPrestation = (prestation: Prestation) => {
    const nouvellePrestation: Prestation = {
      ...prestation,
      id: `prestation-${Date.now()}`,
      libelle: `${prestation.libelle} (copie)`,
    };
    setPrestations([...prestations, nouvellePrestation]);
  };

  const handleDupliquerPiece = (piece: Piece) => {
    const nouvellePiece: Piece = {
      ...piece,
      id: `piece-${Date.now()}`,
      reference: `${piece.reference}-COPY`,
      libelle: `${piece.libelle} (copie)`,
    };
    setPieces([...pieces, nouvellePiece]);
  };

  const handleArchiverPrestation = (prestationId: string) => {
    setPrestations(
      prestations.map((p) => (p.id === prestationId ? { ...p, statut: "archivé" as const } : p))
    );
  };

  const handleArchiverPiece = (pieceId: string) => {
    setPieces(pieces.map((p) => (p.id === pieceId ? { ...p, statut: "archivé" as const } : p)));
  };

  // Calcul automatique du prix de vente
  useMemo(() => {
    if (autoCalculatePrix && activeTab === "pieces") {
      setFormPrixVente(formPrixAchat * formCoefficient);
    }
  }, [formPrixAchat, formCoefficient, autoCalculatePrix, activeTab]);

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                CATALOGUE DE RÉFÉRENCES
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Catalogue{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Prestations & Pièces
                </span>
              </h1>
              <p className="text-sm text-gray-600">Gérer les prestations types et pièces standards</p>
            </div>
            {activeTab === "prestations" ? (
              <Button
                onClick={handleNouvellePrestation}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle prestation
              </Button>
            ) : (
              <Button
                onClick={handleNouvellePiece}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle pièce
              </Button>
            )}
          </div>
        </BlurFade>

        {/* Onglets Prestations / Pièces */}
        <BlurFade inView delay={0.05}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="bg-white border-blue-200/50 mb-4">
              <TabsTrigger value="prestations" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <Wrench className="mr-2 h-4 w-4" />
                Prestations
              </TabsTrigger>
              <TabsTrigger value="pieces" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <Package className="mr-2 h-4 w-4" />
                Pièces
              </TabsTrigger>
            </TabsList>

            {/* Onglet Prestations - Layout Cards */}
            <TabsContent value="prestations" className="space-y-4">
              {/* Recherche et Filtres */}
              <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher une prestation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                      />
                    </div>
                    <Select value={categorieFilter} onValueChange={setCategorieFilter}>
                      <SelectTrigger className="w-full md:w-[200px] bg-white border-blue-300/50 text-gray-900">
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Cards Prestations */}
              <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">Prestations</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {filteredPrestations.length} prestation{filteredPrestations.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPrestations.map((prestation) => (
                      <Card
                        key={prestation.id}
                        className="border border-blue-200/50 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleOpenPrestation(prestation)}
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                                {prestation.libelle}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                  {prestation.categorie}
                                </Badge>
                                <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {prestation.tempsEstime}h
                                </Badge>
                                <Badge className="bg-green-100 text-green-700 border-green-300 text-xs flex items-center gap-1">
                                  <Euro className="h-3 w-3" />
                                  {prestation.prixMainOeuvre
                                    ? `${prestation.prixMainOeuvre}€`
                                    : `${prestation.tauxHoraire}€/h`}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-blue-100/50">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDupliquerPrestation(prestation);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                                title="Dupliquer"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPrestation(prestation);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                                title="Éditer"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiverPrestation(prestation.id);
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-50"
                                title="Archiver"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredPrestations.length === 0 && (
                    <div className="text-center py-12">
                      <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-700/60">Aucune prestation trouvée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Pièces - Layout Table dense */}
            <TabsContent value="pieces" className="space-y-4">
              {/* Recherche */}
              <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une pièce (libellé, référence)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Table dense */}
              <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">Pièces</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {filteredPieces.length} pièce{filteredPieces.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-blue-200/50 bg-blue-50/30">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Référence</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Libellé</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Prix achat</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Coeff</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Prix vente</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPieces.map((piece) => (
                          <tr
                            key={piece.id}
                            className="border-b border-blue-100/50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                            onClick={() => handleOpenPiece(piece)}
                          >
                            <td className="py-3 px-4 text-gray-900 font-medium">{piece.reference}</td>
                            <td className="py-3 px-4 text-gray-700">{piece.libelle}</td>
                            <td className="py-3 px-4 text-gray-700">{piece.prixAchat.toLocaleString()} €</td>
                            <td className="py-3 px-4 text-gray-700">{piece.coefficient}x</td>
                            <td className="py-3 px-4 text-gray-900 font-semibold">
                              {piece.prixVente.toLocaleString()} €
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDupliquerPiece(piece);
                                  }}
                                  className="h-7 w-7 p-0 hover:bg-blue-50"
                                  title="Dupliquer"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPiece(piece);
                                  }}
                                  className="h-7 w-7 p-0 hover:bg-blue-50"
                                  title="Éditer"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiverPiece(piece.id);
                                  }}
                                  className="h-7 w-7 p-0 hover:bg-red-50"
                                  title="Archiver"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredPieces.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-700/60">Aucune pièce trouvée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </BlurFade>

        {/* Sheet Détail/Édition */}
        <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-white border-blue-200/50 text-gray-900">
            <SheetHeader>
              <SheetTitle className="text-gray-900">
                {activeTab === "prestations"
                  ? isCreating
                    ? "Nouvelle prestation"
                    : "Modifier la prestation"
                  : isCreating
                  ? "Nouvelle pièce"
                  : "Modifier la pièce"}
              </SheetTitle>
              <SheetDescription className="text-gray-700/70">
                {activeTab === "prestations"
                  ? isCreating
                    ? "Ajoutez une nouvelle prestation au catalogue"
                    : "Modifiez les informations de la prestation"
                  : isCreating
                  ? "Ajoutez une nouvelle pièce au catalogue"
                  : "Modifiez les informations de la pièce"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {activeTab === "prestations" ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Libellé</label>
                    <Input
                      value={formLibelle}
                      onChange={(e) => setFormLibelle(e.target.value)}
                      placeholder="Ex: Vidange moteur"
                      className="bg-white border-blue-300/50 text-gray-900"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Temps estimé (heures)
                      </label>
                      <Input
                        type="number"
                        step="0.5"
                        value={formTempsEstime}
                        onChange={(e) => setFormTempsEstime(Number(e.target.value))}
                        placeholder="Ex: 1.5"
                        className="bg-white border-blue-300/50 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Catégorie</label>
                      <Input
                        value={formCategorie}
                        onChange={(e) => setFormCategorie(e.target.value)}
                        placeholder="Ex: Entretien"
                        className="bg-white border-blue-300/50 text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Type de tarification
                    </label>
                    <Select
                      value={formTypeTarification}
                      onValueChange={(v) => setFormTypeTarification(v as "fixe" | "horaire")}
                    >
                      <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        <SelectItem value="fixe">Prix main d'œuvre fixe</SelectItem>
                        <SelectItem value="horaire">Taux horaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {formTypeTarification === "fixe" ? "Prix main d'œuvre (€)" : "Taux horaire (€/h)"}
                    </label>
                    <Input
                      type="number"
                      value={formTypeTarification === "fixe" ? formPrixMainOeuvre || "" : formTauxHoraire || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (formTypeTarification === "fixe") {
                          setFormPrixMainOeuvre(value);
                        } else {
                          setFormTauxHoraire(value);
                        }
                      }}
                      placeholder="Ex: 45"
                      className="bg-white border-blue-300/50 text-gray-900"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Libellé</label>
                    <Input
                      value={formLibelle}
                      onChange={(e) => setFormLibelle(e.target.value)}
                      placeholder="Ex: Filtre à huile"
                      className="bg-white border-blue-300/50 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Référence</label>
                    <Input
                      value={formReference}
                      onChange={(e) => setFormReference(e.target.value)}
                      placeholder="Ex: FIL-123"
                      className="bg-white border-blue-300/50 text-gray-900"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Prix d'achat (€)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formPrixAchat}
                        onChange={(e) => {
                          const prix = Number(e.target.value);
                          setFormPrixAchat(prix);
                          if (autoCalculatePrix) {
                            setFormPrixVente(prix * formCoefficient);
                          }
                        }}
                        placeholder="Ex: 8.00"
                        className="bg-white border-blue-300/50 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Coefficient</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formCoefficient}
                        onChange={(e) => {
                          const coeff = Number(e.target.value);
                          setFormCoefficient(coeff);
                          if (autoCalculatePrix) {
                            setFormPrixVente(formPrixAchat * coeff);
                          }
                        }}
                        placeholder="Ex: 2.5"
                        className="bg-white border-blue-300/50 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Prix de vente (€)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formPrixVente}
                        onChange={(e) => {
                          setFormPrixVente(Number(e.target.value));
                          setAutoCalculatePrix(false);
                        }}
                        placeholder="Calculé automatiquement"
                        className="bg-white border-blue-300/50 text-gray-900"
                        disabled={autoCalculatePrix}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {autoCalculatePrix
                          ? `Calcul: ${formPrixAchat} × ${formCoefficient} = ${formPrixVente.toLocaleString()} €`
                          : "Saisie manuelle"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                    <input
                      type="checkbox"
                      id="calculAuto"
                      checked={autoCalculatePrix}
                      onChange={(e) => {
                        setAutoCalculatePrix(e.target.checked);
                        if (e.target.checked) {
                          setFormPrixVente(formPrixAchat * formCoefficient);
                        }
                      }}
                      className="rounded border-blue-300 bg-white text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="calculAuto" className="text-sm text-gray-700 cursor-pointer">
                      Calculer automatiquement le prix de vente (Prix achat × Coefficient)
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-200/50">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailSheetOpen(false)}
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSauvegarder}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isCreating ? "Créer" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default Catalogue;
