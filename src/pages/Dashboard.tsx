import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  Building2,
  Bell,
  Users,
  FileText,
  RefreshCw,
  TrendingUp,
  Mail,
  Phone,
  MessageSquare,
  Plus,
  Clock,
  AlertCircle,
} from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // KPIs
  const kpis = [
    { label: "Chantiers actifs", value: 12, icon: Building2, color: "text-red-400" },
    { label: "Relances à envoyer", value: 5, icon: Bell, color: "text-orange-400" },
    { label: "Prestataires en retard", value: 3, icon: Users, color: "text-red-500" },
    { label: "Documents à signer", value: 7, icon: FileText, color: "text-blue-400" },
  ];

  // Données graphique courbe
  const progressData = [
    { month: "Jan", progression: 15 },
    { month: "Fév", progression: 28 },
    { month: "Mar", progression: 35 },
    { month: "Avr", progression: 42 },
    { month: "Mai", progression: 58 },
    { month: "Juin", progression: 65 },
    { month: "Juil", progression: 72 },
    { month: "Août", progression: 78 },
    { month: "Sep", progression: 82 },
    { month: "Oct", progression: 88 },
    { month: "Nov", progression: 92 },
  ];

  // Données donut chart (types de relances)
  const relanceTypes = [
    { name: "Email", value: 45, color: "#ef4444" },
    { name: "Appel", value: 30, color: "#f97316" },
    { name: "SMS", value: 20, color: "#3b82f6" },
    { name: "Autre", value: 5, color: "#8b5cf6" },
  ];

  // Chantiers détaillés
  const chantiers = [
    {
      nom: "Résidence LUX 14",
      avancement: 80,
      equipe: "Équipe Nord",
      statut: "En temps",
      derniereMAJ: "Il y a 2h",
    },
    {
      nom: "Rénovation Béziers Centre",
      avancement: 65,
      equipe: "Équipe Sud",
      statut: "À surveiller",
      derniereMAJ: "Il y a 5h",
    },
    {
      nom: "Programme Neuf Narbonne",
      avancement: 42,
      equipe: "Équipe Est",
      statut: "En retard",
      derniereMAJ: "Il y a 1j",
    },
    {
      nom: "Box Stockage ZI Est",
      avancement: 88,
      equipe: "Équipe Ouest",
      statut: "En temps",
      derniereMAJ: "Il y a 30min",
    },
  ];

  // Prestataires
  const prestataires = [
    { nom: "Élec Ouest", metier: "Électricien", nbChantiers: 2, statut: "Actif", dernierContact: "Aujourd'hui" },
    { nom: "Plomberie Duval", metier: "Plombier", nbChantiers: 1, statut: "En retard", dernierContact: "Il y a 3j" },
    { nom: "Menuiserie Languedoc", metier: "Menuisier", nbChantiers: 3, statut: "Actif", dernierContact: "Hier" },
    { nom: "Gros Œuvre Pro", metier: "Gros œuvre", nbChantiers: 2, statut: "À surveiller", dernierContact: "Il y a 2j" },
  ];

  // Relances
  const relances = [
    {
      type: "Email",
      prestataire: "Plomberie Duval",
      chantier: "Résidence LUX 14",
      dateLimite: "Aujourd'hui",
      statut: "Urgent",
    },
    {
      type: "Appel",
      prestataire: "Élec Ouest",
      chantier: "Rénovation Béziers",
      dateLimite: "Demain",
      statut: "À faire",
    },
    {
      type: "SMS",
      prestataire: "Menuiserie Languedoc",
      chantier: "Programme Neuf Narbonne",
      dateLimite: "Dans 2j",
      statut: "Planifié",
    },
  ];

  // Timeline activité récente
  const timeline = [
    { heure: "14:30", action: "Relance envoyée à Plomberie Duval", type: "relance" },
    { heure: "13:15", action: "Nouveau chantier créé : Résidence LUX 14", type: "chantier" },
    { heure: "11:45", action: "Devis signé pour Programme Neuf Narbonne", type: "document" },
    { heure: "10:20", action: "Prestataire Élec Ouest ajouté", type: "prestataire" },
    { heure: "09:00", action: "Relance envoyée à Menuiserie Languedoc", type: "relance" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En temps":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">En temps</Badge>;
      case "En retard":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">En retard</Badge>;
      case "À surveiller":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">À surveiller</Badge>;
      case "Actif":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Actif</Badge>;
      case "Urgent":
        return <Badge className="bg-red-500/30 text-red-300 border-red-500/50">Urgent</Badge>;
      case "À faire":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">À faire</Badge>;
      case "Planifié":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Planifié</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "relance":
        return <Bell className="h-4 w-4 text-orange-400" />;
      case "chantier":
        return <Building2 className="h-4 w-4 text-blue-400" />;
      case "document":
        return <FileText className="h-4 w-4 text-green-400" />;
      case "prestataire":
        return <Users className="h-4 w-4 text-purple-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-red-50">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-300">Cockpit de pilotage</p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Tableau de{" "}
                <span className="bg-gradient-to-r from-red-200 via-red-400 to-red-300 bg-clip-text text-transparent">
                  bord
                </span>
              </h1>
              <p className="text-sm text-red-100/80">Vue d'ensemble de votre activité</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-red-200/60">Dernière mise à jour</p>
                <p className="text-sm font-medium text-red-100">Il y a 2 minutes</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/30 bg-black/40 text-red-100 hover:bg-red-500/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* KPIs Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, idx) => (
            <BlurFade key={kpi.label} inView delay={0.05 * (idx + 1)}>
              <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-200/70 mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold text-white">{kpi.value}</p>
                    </div>
                    <div className={`${kpi.color} bg-red-500/10 p-3 rounded-xl`}>
                      <kpi.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid gap-6 md:grid-cols-2">
          <BlurFade inView delay={0.3}>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progression globale des chantiers
                </CardTitle>
                <CardDescription className="text-red-200/60">Évolution mensuelle en %</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <XAxis dataKey="month" stroke="#fca5a5" />
                    <YAxis stroke="#fca5a5" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.9)",
                        border: "1px solid rgba(248,113,113,0.3)",
                        borderRadius: "8px",
                        color: "#fecaca",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="progression"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade inView delay={0.35}>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Types de relances envoyées
                </CardTitle>
                <CardDescription className="text-red-200/60">Répartition par canal</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={relanceTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {relanceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.9)",
                        border: "1px solid rgba(248,113,113,0.3)",
                        borderRadius: "8px",
                        color: "#fecaca",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        {/* Tableaux */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tableau Chantiers */}
          <BlurFade inView delay={0.4}>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Chantiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-red-900/30">
                        <th className="text-left py-3 px-2 font-semibold text-red-200">Nom</th>
                        <th className="text-left py-3 px-2 font-semibold text-red-200">Avancement</th>
                        <th className="text-left py-3 px-2 font-semibold text-red-200">Statut</th>
                        <th className="text-left py-3 px-2 font-semibold text-red-200">Mise à jour</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chantiers.map((chantier, idx) => (
                        <tr key={idx} className="border-b border-red-900/20 hover:bg-red-950/20 transition-colors">
                          <td className="py-3 px-2">
                            <p className="font-medium text-white">{chantier.nom}</p>
                            <p className="text-xs text-red-200/60">{chantier.equipe}</p>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-red-950/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-red-500 to-red-600"
                                  style={{ width: `${chantier.avancement}%` }}
                                />
                              </div>
                              <span className="text-xs text-red-200">{chantier.avancement}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">{getStatusBadge(chantier.statut)}</td>
                          <td className="py-3 px-2 text-xs text-red-200/60">{chantier.derniereMAJ}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Tableau Prestataires */}
          <BlurFade inView delay={0.45}>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Prestataires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-red-900/30">
                        <th className="text-left py-3 px-2 font-semibold text-red-200">Nom</th>
                        <th className="text-left py-3 px-2 font-semibold text-red-200">Métier</th>
                        <th className="text-left py-3 px-2 font-semibold text-red-200">Chantiers</th>
                        <th className="text-left py-3 px-2 font-semibold text-red-200">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prestataires.map((prestataire, idx) => (
                        <tr key={idx} className="border-b border-red-900/20 hover:bg-red-950/20 transition-colors">
                          <td className="py-3 px-2 font-medium text-white">{prestataire.nom}</td>
                          <td className="py-3 px-2 text-red-200/80">{prestataire.metier}</td>
                          <td className="py-3 px-2 text-red-200/80">{prestataire.nbChantiers}</td>
                          <td className="py-3 px-2">{getStatusBadge(prestataire.statut)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        {/* Relances Table */}
        <BlurFade inView delay={0.5}>
          <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Relances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-900/30">
                      <th className="text-left py-3 px-2 font-semibold text-red-200">Type</th>
                      <th className="text-left py-3 px-2 font-semibold text-red-200">Prestataire</th>
                      <th className="text-left py-3 px-2 font-semibold text-red-200">Chantier</th>
                      <th className="text-left py-3 px-2 font-semibold text-red-200">Date limite</th>
                      <th className="text-left py-3 px-2 font-semibold text-red-200">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relances.map((relance, idx) => (
                      <tr key={idx} className="border-b border-red-900/20 hover:bg-red-950/20 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {relance.type === "Email" && <Mail className="h-4 w-4 text-red-400" />}
                            {relance.type === "Appel" && <Phone className="h-4 w-4 text-orange-400" />}
                            {relance.type === "SMS" && <MessageSquare className="h-4 w-4 text-blue-400" />}
                            <span className="text-white">{relance.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-red-200/80">{relance.prestataire}</td>
                        <td className="py-3 px-2 text-red-200/80">{relance.chantier}</td>
                        <td className="py-3 px-2 text-red-200/80">{relance.dateLimite}</td>
                        <td className="py-3 px-2">{getStatusBadge(relance.statut)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Timeline + Actions rapides */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline */}
          <BlurFade inView delay={0.55} className="lg:col-span-2">
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">{getTimelineIcon(item.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-red-300">{item.heure}</span>
                        </div>
                        <p className="text-sm text-red-100/80">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Actions rapides */}
          <BlurFade inView delay={0.6}>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau chantier
                </Button>
                <Button
                  className="w-full justify-start border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une relance
                </Button>
                <Button
                  className="w-full justify-start border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Inviter un prestataire
                </Button>
                <Button
                  className="w-full justify-start border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter document
                </Button>
              </CardContent>
            </Card>
          </BlurFade>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
