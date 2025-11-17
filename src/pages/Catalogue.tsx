import { useState } from "react";
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
  Wrench,
  Package,
  Edit,
  Archive,
  Copy,
  Euro,
  Clock,
  Trash2,
  CheckCircle2,
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
  statut: "actif" | "archivé";
}

const Catalogue = () => {
  const [activeTab, setActiveTab] = useState<"prestations" | "pieces">("prestations");
  const [searchPrestation, setSearchPrestation] = useState("");
  const [searchPiece, setSearchPiece] = useState("");
  const [selectedPrestation, setSelectedPrestation] = useState<Prestation | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [isPrestationDialogOpen, setIsPrestationDialogOpen] = useState(false);
  const [isPieceDialogOpen, setIsPieceDialogOpen] = useState(false);
  const [isCreatePrestation, setIsCreatePrestation] = useState(false);
  const [isCreatePiece, setIsCreatePiece] = useState(false);

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
      categorie: "Réparation",
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

  const filteredPrestations = prestations.filter((p) => {
    const matchesSearch =
      searchPrestation === "" ||
      p.libelle.toLowerCase().includes(searchPrestation.toLowerCase()) ||
      p.categorie.toLowerCase().includes(searchPrestation.toLowerCase());
    const isActive = p.statut === "actif";
    return matchesSearch && isActive;
  });

  const filteredPieces = pieces.filter((p) => {
    const matchesSearch =
      searchPiece === "" ||
      p.libelle.toLowerCase().includes(searchPiece.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchPiece.toLowerCase());
    const isActive = p.statut === "actif";
    return matchesSearch && isActive;
  });

  const handleNouvellePrestation = () => {
    setSelectedPrestation(null);
    setIsCreatePrestation(true);
    setIsPrestationDialogOpen(true);
  };

  const handleModifierPrestation = (prestation: Prestation) => {
    setSelectedPrestation(prestation);
    setIsCreatePrestation(false);
    setIsPrestationDialogOpen(true);
  };

  const handleDupliquerPrestation = (prestation: Prestation) => {
    const nouvellePrestation: Prestation = {
      ...prestation,
      id: `prestation-${Date.now()}`,
      libelle: `${prestation.libelle} (copie)`,
    };
    setPrestations([...prestations, nouvellePrestation]);
  };

  const handleArchiverPrestation = (prestationId: string) => {
    setPrestations(
      prestations.map((p) => (p.id === prestationId ? { ...p, statut: "archivé" as const } : p))
    );
  };

  const handleNouvellePiece = () => {
    setSelectedPiece(null);
    setIsCreatePiece(true);
    setIsPieceDialogOpen(true);
  };

  const handleModifierPiece = (piece: Piece) => {
    setSelectedPiece(piece);
    setIsCreatePiece(false);
    setIsPieceDialogOpen(true);
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

  const handleArchiverPiece = (pieceId: string) => {
    setPieces(pieces.map((p) => (p.id === pieceId ? { ...p, statut: "archivé" as const } : p)));
  };

  const handleSauvegarderPrestation = () => {
    // Logique de sauvegarde (ici on fait juste fermer le dialog)
    setIsPrestationDialogOpen(false);
    setSelectedPrestation(null);
  };

  const handleSauvegarderPiece = () => {
    // Logique de sauvegarde (ici on fait juste fermer le dialog)
    setIsPieceDialogOpen(false);
    setSelectedPiece(null);
  };

  const calculerPrixVente = (prixAchat: number, coefficient: number) => {
    return prixAchat * coefficient;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                Catalogue de références
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Catalogue{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Prestations & Pièces
                </span>
              </h1>
              <p className="text-sm text-gray-600">Gérer les prestations types et pièces standards</p>
            </div>
          </div>
        </BlurFade>

        {/* Onglets Prestations / Pièces */}
        <BlurFade inView delay={0.05}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-white border-blue-200/50">
                <TabsTrigger value="prestations" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <Wrench className="mr-2 h-4 w-4" />
                  Prestations
                </TabsTrigger>
                <TabsTrigger value="pieces" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <Package className="mr-2 h-4 w-4" />
                  Pièces
                </TabsTrigger>
              </TabsList>
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

            {/* Onglet Prestations */}
            <TabsContent value="prestations">
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
                  {/* Recherche */}
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une prestation..."
                      value={searchPrestation}
                      onChange={(e) => setSearchPrestation(e.target.value)}
                      className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>

                  {/* Liste */}
                  <div className="space-y-2">
                    {filteredPrestations.map((prestation) => (
                      <div
                        key={prestation.id}
                        className="p-4 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Wrench className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-semibold text-gray-900">{prestation.libelle}</p>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <span>{prestation.tempsEstime}h</span>
                                  </div>
                                  {prestation.prixMainOeuvre ? (
                                    <div className="flex items-center gap-1">
                                      <Euro className="h-4 w-4 text-blue-600" />
                                      <span>{prestation.prixMainOeuvre}€ (prix fixe)</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <Euro className="h-4 w-4 text-blue-600" />
                                      <span>{prestation.tauxHoraire}€/h (taux horaire)</span>
                                    </div>
                                  )}
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                    {prestation.categorie}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDupliquerPrestation(prestation)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleModifierPrestation(prestation)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleArchiverPrestation(prestation.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Archive className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
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

            {/* Onglet Pièces */}
            <TabsContent value="pieces">
              <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">Pièces</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {filteredPieces.length} pièce{filteredPieces.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Recherche */}
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une pièce (libellé, référence)..."
                      value={searchPiece}
                      onChange={(e) => setSearchPiece(e.target.value)}
                      className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>

                  {/* Liste */}
                  <div className="space-y-2">
                    {filteredPieces.map((piece) => (
                      <div
                        key={piece.id}
                        className="p-4 border border-blue-200/50 rounded-lg bg-white hover:bg-blue-50/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Package className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-semibold text-gray-900">{piece.libelle}</p>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                  <span className="font-medium">Ref: {piece.reference}</span>
                                  <div className="flex items-center gap-1">
                                    <Euro className="h-4 w-4 text-blue-600" />
                                    <span>Achat: {piece.prixAchat.toLocaleString()}€</span>
                                  </div>
                                  <span>Coef: {piece.coefficient}x</span>
                                  <div className="flex items-center gap-1 font-semibold text-gray-900">
                                    <Euro className="h-4 w-4 text-green-600" />
                                    <span>Vente: {piece.prixVente.toLocaleString()}€</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDupliquerPiece(piece)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleModifierPiece(piece)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleArchiverPiece(piece.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Archive className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
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

        {/* Dialog Création/Modification Prestation */}
        <Dialog open={isPrestationDialogOpen} onOpenChange={setIsPrestationDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {isCreatePrestation ? "Nouvelle prestation" : "Modifier la prestation"}
              </DialogTitle>
              <DialogDescription className="text-gray-700/70">
                {isCreatePrestation
                  ? "Ajoutez une nouvelle prestation au catalogue"
                  : "Modifiez les informations de la prestation"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Libellé</label>
                <Input
                  defaultValue={selectedPrestation?.libelle || ""}
                  placeholder="Ex: Vidange moteur"
                  className="bg-white border-blue-300/50 text-gray-900"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Temps estimé (heures)</label>
                  <Input
                    type="number"
                    step="0.5"
                    defaultValue={selectedPrestation?.tempsEstime || 0}
                    placeholder="Ex: 1.5"
                    className="bg-white border-blue-300/50 text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Catégorie</label>
                  <Input
                    defaultValue={selectedPrestation?.categorie || ""}
                    placeholder="Ex: Entretien"
                    className="bg-white border-blue-300/50 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type de tarification</label>
                <Select defaultValue={selectedPrestation?.prixMainOeuvre ? "fixe" : "horaire"}>
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
                  {selectedPrestation?.prixMainOeuvre ? "Prix main d'œuvre (€)" : "Taux horaire (€/h)"}
                </label>
                <Input
                  type="number"
                  defaultValue={
                    selectedPrestation?.prixMainOeuvre || selectedPrestation?.tauxHoraire || 0
                  }
                  placeholder="Ex: 45"
                  className="bg-white border-blue-300/50 text-gray-900"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPrestationDialogOpen(false)}
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSauvegarderPrestation}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isCreatePrestation ? "Créer" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Création/Modification Pièce */}
        <Dialog open={isPieceDialogOpen} onOpenChange={setIsPieceDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {isCreatePiece ? "Nouvelle pièce" : "Modifier la pièce"}
              </DialogTitle>
              <DialogDescription className="text-gray-700/70">
                {isCreatePiece
                  ? "Ajoutez une nouvelle pièce au catalogue"
                  : "Modifiez les informations de la pièce"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Libellé</label>
                <Input
                  defaultValue={selectedPiece?.libelle || ""}
                  placeholder="Ex: Filtre à huile"
                  className="bg-white border-blue-300/50 text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Référence</label>
                <Input
                  defaultValue={selectedPiece?.reference || ""}
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
                    defaultValue={selectedPiece?.prixAchat || 0}
                    placeholder="Ex: 8.00"
                    className="bg-white border-blue-300/50 text-gray-900"
                    onChange={(e) => {
                      const prixAchat = Number(e.target.value);
                      const coefficient = selectedPiece?.coefficient || 2;
                      // Mettre à jour le prix de vente calculé
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Coefficient</label>
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={selectedPiece?.coefficient || 2}
                    placeholder="Ex: 2.5"
                    className="bg-white border-blue-300/50 text-gray-900"
                    onChange={(e) => {
                      const coefficient = Number(e.target.value);
                      const prixAchat = selectedPiece?.prixAchat || 0;
                      // Mettre à jour le prix de vente calculé
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Prix de vente (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={selectedPiece?.prixVente || 0}
                    placeholder="Calculé automatiquement"
                    className="bg-white border-blue-300/50 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Calcul: Prix achat × Coefficient = {selectedPiece
                      ? calculerPrixVente(selectedPiece.prixAchat, selectedPiece.coefficient).toLocaleString()
                      : 0}{" "}
                    €
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <input
                  type="checkbox"
                  id="calculAuto"
                  className="rounded border-blue-300 bg-white text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <label htmlFor="calculAuto" className="text-sm text-gray-700 cursor-pointer">
                  Calculer automatiquement le prix de vente (Prix achat × Coefficient)
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPieceDialogOpen(false)}
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSauvegarderPiece}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isCreatePiece ? "Créer" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Catalogue;

