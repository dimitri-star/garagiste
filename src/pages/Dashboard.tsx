import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  FileText,
  RefreshCw,
  TrendingUp,
  Euro,
  Plus,
  Clock,
  Mail,
  CheckCircle2,
  Send,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface Devis {
  id: string;
  numero: string;
  client: string;
  montant: number;
  dateCreation: string;
  dateEnvoi?: string;
  statut: "brouillon" | "envoyé" | "accepté";
  joursSansReponse?: number;
}

interface TacheRelance {
  id: string;
  type: "devis" | "facture";
  objet: string;
  client: string;
  montant?: number;
  dateEcheance: string;
  faite: boolean;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"envoyer" | "relancer" | "acceptes">("envoyer");
  const [filtreActif, setFiltreActif] = useState<string | null>(null);
  const [tachesRelances, setTachesRelances] = useState<TacheRelance[]>([
    {
      id: "1",
      type: "devis",
      objet: "Devis #DEV-2024-001 - Rénovation salle de bain",
      client: "Jean Dupont",
      montant: 2500,
      dateEcheance: "Aujourd'hui",
      faite: false,
    },
    {
      id: "2",
      type: "facture",
      objet: "Facture #FAC-2024-045 - Intervention réparation",
      client: "Marie Martin",
      montant: 850,
      dateEcheance: "Aujourd'hui",
      faite: false,
    },
    {
      id: "3",
      type: "devis",
      objet: "Devis #DEV-2024-087 - Remplacement chaudière",
      client: "Pierre Bernard",
      montant: 4500,
      dateEcheance: "Demain",
      faite: false,
    },
  ]);

  // Données synthèse
  const devisCreesSemaine = 12;
  const devisCreesMois = 48;
  const devisEnAttente = 8;
  const tauxConversion = 68; // %
  const caDevisAcceptes = 12500; // €

  // Données devis
  const devisBrouillon: Devis[] = [
    {
      id: "1",
      numero: "DEV-2024-101",
      client: "Jean Dupont",
      montant: 2500,
      dateCreation: "2024-01-15",
      statut: "brouillon",
    },
    {
      id: "2",
      numero: "DEV-2024-102",
      client: "Marie Martin",
      montant: 1850,
      dateCreation: "2024-01-14",
      statut: "brouillon",
    },
    {
      id: "3",
      numero: "DEV-2024-103",
      client: "Pierre Bernard",
      montant: 3200,
      dateCreation: "2024-01-13",
      statut: "brouillon",
    },
  ];

  const devisARelancer: Devis[] = [
    {
      id: "4",
      numero: "DEV-2024-089",
      client: "Sophie Laurent",
      montant: 4500,
      dateCreation: "2024-01-08",
      dateEnvoi: "2024-01-08",
      statut: "envoyé",
      joursSansReponse: 7,
    },
    {
      id: "5",
      numero: "DEV-2024-095",
      client: "Luc Moreau",
      montant: 2800,
      dateCreation: "2024-01-10",
      dateEnvoi: "2024-01-10",
      statut: "envoyé",
      joursSansReponse: 5,
    },
    {
      id: "6",
      numero: "DEV-2024-098",
      client: "Anne Petit",
      montant: 1900,
      dateCreation: "2024-01-12",
      dateEnvoi: "2024-01-12",
      statut: "envoyé",
      joursSansReponse: 3,
    },
  ];

  const devisAcceptes: Devis[] = [
    {
      id: "7",
      numero: "DEV-2024-087",
      client: "Claude Dubois",
      montant: 5200,
      dateCreation: "2024-01-05",
      dateEnvoi: "2024-01-05",
      statut: "accepté",
    },
    {
      id: "8",
      numero: "DEV-2024-092",
      client: "François Leroy",
      montant: 3100,
      dateCreation: "2024-01-09",
      dateEnvoi: "2024-01-09",
      statut: "accepté",
    },
    {
      id: "9",
      numero: "DEV-2024-096",
      client: "Isabelle Garcia",
      montant: 2750,
      dateCreation: "2024-01-11",
      dateEnvoi: "2024-01-11",
      statut: "accepté",
    },
  ];

  // Filtrer les devis selon le filtre actif et l'onglet
  const getDevisFiltres = () => {
    let devis = [];
    if (filtreActif === "crees") {
      devis = [...devisBrouillon];
    } else if (filtreActif === "attente") {
      devis = devisARelancer;
    } else if (filtreActif === "conversion" || filtreActif === "ca") {
      devis = devisAcceptes;
    } else {
      switch (activeTab) {
        case "envoyer":
          devis = devisBrouillon;
          break;
        case "relancer":
          devis = devisARelancer;
          break;
        case "acceptes":
          devis = devisAcceptes;
          break;
      }
    }
    return devis;
  };

  const handleMarquerCommeFaite = (id: string) => {
    setTachesRelances((prev) =>
      prev.map((tache) => (tache.id === id ? { ...tache, faite: true } : tache))
    );
  };

  const devisFiltres = getDevisFiltres();

  // KPIs synthèse
  const kpis = [
    {
      label: "Devis créés cette semaine",
      value: devisCreesSemaine,
      sousValeur: `${devisCreesMois} ce mois`,
      icon: FileText,
      color: "text-blue-600",
      filtreKey: "crees",
    },
    {
      label: "Devis en attente",
      value: devisEnAttente,
      sousValeur: "Envoyés, non répondus",
      icon: Clock,
      color: "text-orange-600",
      filtreKey: "attente",
    },
    {
      label: "Taux de conversion",
      value: `${tauxConversion}%`,
      sousValeur: "devis → factures",
      icon: TrendingUp,
      color: "text-green-600",
      filtreKey: "conversion",
    },
    {
      label: "CA devis acceptés",
      value: `${caDevisAcceptes.toLocaleString()} €`,
      sousValeur: "sur la période",
      icon: Euro,
      color: "text-blue-600",
      filtreKey: "ca",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Cockpit de gestion</p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Tableau de{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  bord
                </span>
              </h1>
              <p className="text-sm text-gray-600">Vue d'ensemble de votre activité</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
              </Button>
              <div className="text-right">
                <p className="text-xs text-gray-500">Dernière mise à jour</p>
                <p className="text-sm font-medium text-gray-700">Il y a 2 minutes</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Cartes synthèse */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, idx) => (
            <BlurFade key={kpi.label} inView delay={0.05 * (idx + 1)}>
              <Card
                className={`card-3d border ${
                  filtreActif === kpi.filtreKey
                    ? "border-blue-500 bg-blue-50/50 shadow-md"
                    : "border-blue-200/50 bg-white"
                } text-gray-900 backdrop-blur-xl group shadow-sm cursor-pointer transition-all hover:border-blue-400 hover:shadow-md`}
                onClick={() => {
                  setFiltreActif(filtreActif === kpi.filtreKey ? null : kpi.filtreKey);
                  // Changer l'onglet selon le filtre
                  if (kpi.filtreKey === "crees") setActiveTab("envoyer");
                  else if (kpi.filtreKey === "attente") setActiveTab("relancer");
                  else if (kpi.filtreKey === "ca" || kpi.filtreKey === "conversion") setActiveTab("acceptes");
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{kpi.sousValeur}</p>
                    </div>
                    <div className={`${kpi.color} bg-blue-50 p-3 rounded-xl`}>
                      <kpi.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>

        {/* Tableau "Devis à traiter" */}
        <BlurFade inView delay={0.2}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Devis à traiter</CardTitle>
              <CardDescription className="text-gray-600">
                Gérez vos devis en cours selon leur statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="bg-white border-blue-200/50 mb-4">
                  <TabsTrigger value="envoyer" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                    À envoyer
                  </TabsTrigger>
                  <TabsTrigger value="relancer" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                    À relancer
                  </TabsTrigger>
                  <TabsTrigger value="acceptes" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                    Récemment acceptés
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="envoyer">
                  <div className="space-y-3">
                    {devisFiltres.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>Aucun devis en brouillon à envoyer</p>
                      </div>
                    ) : (
                      devisFiltres.map((devis) => (
                        <div
                          key={devis.id}
                          className="flex items-center justify-between p-4 border border-blue-200/50 rounded-lg hover:bg-blue-50/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-semibold text-gray-900">{devis.numero}</p>
                                <p className="text-sm text-gray-600">{devis.client}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{devis.montant.toLocaleString()} €</p>
                              <p className="text-xs text-gray-500">
                                Créé le {format(new Date(devis.dateCreation), "d MMM yyyy", { locale: fr })}
                              </p>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Send className="mr-2 h-4 w-4" />
                              Envoyer
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="relancer">
                  <div className="space-y-3">
                    {devisFiltres.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>Aucun devis à relancer</p>
                      </div>
                    ) : (
                      devisFiltres.map((devis) => (
                        <div
                          key={devis.id}
                          className="flex items-center justify-between p-4 border border-orange-200/50 rounded-lg hover:bg-orange-50/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-orange-600" />
                              <div>
                                <p className="font-semibold text-gray-900">{devis.numero}</p>
                                <p className="text-sm text-gray-600">{devis.client}</p>
                                <Badge className="bg-orange-100 text-orange-700 border-orange-300 mt-1">
                                  {devis.joursSansReponse} jour{devis.joursSansReponse && devis.joursSansReponse > 1 ? "s" : ""} sans réponse
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{devis.montant.toLocaleString()} €</p>
                              <p className="text-xs text-gray-500">
                                Envoyé le {devis.dateEnvoi && format(new Date(devis.dateEnvoi), "d MMM yyyy", { locale: fr })}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-50">
                              <Mail className="mr-2 h-4 w-4" />
                              Relancer
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="acceptes">
                  <div className="space-y-3">
                    {devisFiltres.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>Aucun devis accepté récemment</p>
                      </div>
                    ) : (
                      devisFiltres.map((devis) => (
                        <div
                          key={devis.id}
                          className="flex items-center justify-between p-4 border border-green-200/50 rounded-lg hover:bg-green-50/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-semibold text-gray-900">{devis.numero}</p>
                                <p className="text-sm text-gray-600">{devis.client}</p>
                                <Badge className="bg-green-100 text-green-700 border-green-300 mt-1">
                                  Accepté
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{devis.montant.toLocaleString()} €</p>
                              <p className="text-xs text-gray-500">
                                Accepté le {devis.dateEnvoi && format(new Date(devis.dateEnvoi), "d MMM yyyy", { locale: fr })}
                              </p>
                            </div>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              <FileText className="mr-2 h-4 w-4" />
                              Créer facture
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Bloc "Tâches / relances du jour" */}
        <BlurFade inView delay={0.3}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Tâches / relances du jour</CardTitle>
                  <CardDescription className="text-gray-600">
                    Liste des relances à faire (devis, factures)
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {tachesRelances.filter((t) => !t.faite).length} à faire
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tachesRelances.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>Toutes les tâches sont terminées !</p>
                  </div>
                ) : (
                  tachesRelances.map((tache) => (
                    <div
                      key={tache.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        tache.faite
                          ? "border-green-200/50 bg-green-50/30 opacity-60"
                          : "border-blue-200/50 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {tache.type === "devis" ? (
                          <FileText className={`h-5 w-5 ${tache.faite ? "text-green-600" : "text-blue-600"}`} />
                        ) : (
                          <Euro className={`h-5 w-5 ${tache.faite ? "text-green-600" : "text-blue-600"}`} />
                        )}
                        <div className="flex-1">
                          <p className={`font-semibold ${tache.faite ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {tache.objet}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-600">{tache.client}</p>
                            {tache.montant && (
                              <>
                                <span className="text-gray-400">•</span>
                                <p className="text-sm font-medium text-gray-700">{tache.montant.toLocaleString()} €</p>
                              </>
                            )}
                            <span className="text-gray-400">•</span>
                            <p className="text-sm text-gray-500">{tache.dateEcheance}</p>
                          </div>
                        </div>
                      </div>
                      {!tache.faite && (
                        <Button
                          size="sm"
                          onClick={() => handleMarquerCommeFaite(tache.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marquer comme faite
                        </Button>
                      )}
                      {tache.faite && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Faite
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
