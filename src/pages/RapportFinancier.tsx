import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  CreditCard,
  Wallet,
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";

const RapportFinancier = () => {
  const [periode, setPeriode] = useState<string>("mois");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));

  // KPIs Financiers
  const kpis = [
    {
      label: "Chiffre d'affaires",
      value: "€ 245 000",
      evolution: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      label: "Dépenses totales",
      value: "€ 180 000",
      evolution: "-5.2%",
      isPositive: true,
      icon: Receipt,
      color: "text-red-400",
    },
    {
      label: "Bénéfice net",
      value: "€ 65 000",
      evolution: "+28.3%",
      isPositive: true,
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      label: "Marge bénéficiaire",
      value: "26.5%",
      evolution: "+3.2%",
      isPositive: true,
      icon: BarChart3,
      color: "text-purple-400",
    },
  ];

  // Données CA mensuel
  const caData = [
    { month: "Jan", ca: 180000, depenses: 140000, benefice: 40000 },
    { month: "Fév", ca: 195000, depenses: 150000, benefice: 45000 },
    { month: "Mar", ca: 210000, depenses: 160000, benefice: 50000 },
    { month: "Avr", ca: 220000, depenses: 165000, benefice: 55000 },
    { month: "Mai", ca: 235000, depenses: 175000, benefice: 60000 },
    { month: "Juin", ca: 245000, depenses: 180000, benefice: 65000 },
  ];

  // Répartition des dépenses
  const depensesParType = [
    { name: "Prestataires", value: 45, montant: 81000, color: "#ef4444" },
    { name: "Matériaux", value: 25, montant: 45000, color: "#f97316" },
    { name: "Main d'œuvre", value: 20, montant: 36000, color: "#3b82f6" },
    { name: "Autres", value: 10, montant: 18000, color: "#8b5cf6" },
  ];

  // Revenus par chantier
  const revenusParChantier = [
    { chantier: "Rénovation T3 Champs-Élysées", ca: 45000, depenses: 32000, benefice: 13000, marge: 28.9 },
    { chantier: "Résidence Les Chênes", ca: 38000, depenses: 28000, benefice: 10000, marge: 26.3 },
    { chantier: "Programme Neuf Narbonne", ca: 52000, depenses: 40000, benefice: 12000, marge: 23.1 },
    { chantier: "Studio République", ca: 28000, depenses: 20000, benefice: 8000, marge: 28.6 },
    { chantier: "Villa Agde", ca: 35000, depenses: 25000, benefice: 10000, marge: 28.6 },
    { chantier: "Rénovation Béziers Centre", ca: 41000, depenses: 30000, benefice: 11000, marge: 26.8 },
  ];

  // Factures en attente
  const facturesEnAttente = [
    { client: "M. et Mme Dubois", montant: 15000, date: "2025-11-15", statut: "En attente" },
    { client: "M. Lambert", montant: 25000, date: "2025-11-20", statut: "En attente" },
    { client: "Promoteur ABC", montant: 18000, date: "2025-11-18", statut: "En attente" },
  ];

  // Dépenses récentes
  const depensesRecentes = [
    { prestataire: "Plomberie Duval", montant: 8500, date: "2025-11-14", type: "Prestataire" },
    { prestataire: "Élec Ouest", montant: 6200, date: "2025-11-13", type: "Prestataire" },
    { prestataire: "Matériaux Pro", montant: 3200, date: "2025-11-12", type: "Matériaux" },
    { prestataire: "Gros Œuvre Biterrois", montant: 12000, date: "2025-11-10", type: "Prestataire" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 text-red-50">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-300">
                Analyse financière
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Rapport{" "}
                <span className="bg-gradient-to-r from-red-200 via-red-400 to-red-300 bg-clip-text text-transparent">
                  Financier
                </span>
              </h1>
              <p className="text-sm text-red-100/80">
                Suivez vos revenus, dépenses et bénéfices par chantier et par période
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={periode} onValueChange={setPeriode}>
                <SelectTrigger className="w-[150px] bg-black/40 border-red-500/30 text-red-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-red-900/40 text-red-100">
                  <SelectItem value="mois">Par mois</SelectItem>
                  <SelectItem value="trimestre">Par trimestre</SelectItem>
                  <SelectItem value="annee">Par année</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0">
                <Download className="mr-2 h-4 w-4" />
                Exporter PDF
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* KPIs Financiers */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, idx) => (
            <BlurFade key={kpi.label} inView delay={0.05 * (idx + 1)}>
              <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-red-200/70 mb-1">{kpi.label}</p>
                      <p className="text-2xl font-bold text-white mb-2">{kpi.value}</p>
                      <div className="flex items-center gap-2">
                        {kpi.isPositive ? (
                          <ArrowUpRight className="h-4 w-4 text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${kpi.isPositive ? "text-green-400" : "text-red-400"}`}>
                          {kpi.evolution}
                        </span>
                        <span className="text-xs text-red-300/60">vs mois dernier</span>
                      </div>
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
          {/* Évolution CA / Dépenses / Bénéfice */}
          <BlurFade inView delay={0.3}>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Évolution financière
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={caData}>
                    <defs>
                      <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBenefice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#fca5a5" />
                    <YAxis stroke="#fca5a5" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.9)",
                        border: "1px solid rgba(248,113,113,0.3)",
                        borderRadius: "8px",
                        color: "#fecaca",
                      }}
                      formatter={(value: number) => `€ ${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="ca" stroke="#ef4444" fillOpacity={1} fill="url(#colorCa)" name="CA" />
                    <Area type="monotone" dataKey="depenses" stroke="#f97316" fillOpacity={1} fill="url(#colorDepenses)" name="Dépenses" />
                    <Area type="monotone" dataKey="benefice" stroke="#22c55e" fillOpacity={1} fill="url(#colorBenefice)" name="Bénéfice" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Répartition des dépenses */}
          <BlurFade inView delay={0.35}>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Répartition des dépenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={depensesParType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {depensesParType.map((entry, index) => (
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
                      formatter={(value: number, name: string, props: any) => [
                        `€ ${props.payload.montant.toLocaleString()}`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {depensesParType.map((depense) => (
                    <div key={depense.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: depense.color }} />
                        <span className="text-red-200/80">{depense.name}</span>
                      </div>
                      <span className="font-semibold text-white">€ {depense.montant.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        {/* Tableau Revenus par chantier */}
        <BlurFade inView delay={0.4}>
          <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenus par chantier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-900/30 bg-red-950/20">
                      <th className="text-left py-3 px-4 font-semibold text-red-200">Chantier</th>
                      <th className="text-left py-3 px-4 font-semibold text-red-200">CA</th>
                      <th className="text-left py-3 px-4 font-semibold text-red-200">Dépenses</th>
                      <th className="text-left py-3 px-4 font-semibold text-red-200">Bénéfice</th>
                      <th className="text-left py-3 px-4 font-semibold text-red-200">Marge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenusParChantier.map((chantier, idx) => (
                      <tr key={idx} className="border-b border-red-900/20 hover:bg-red-950/20 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{chantier.chantier}</td>
                        <td className="py-3 px-4 text-green-400 font-semibold">€ {chantier.ca.toLocaleString()}</td>
                        <td className="py-3 px-4 text-red-400">€ {chantier.depenses.toLocaleString()}</td>
                        <td className="py-3 px-4 text-blue-400 font-semibold">€ {chantier.benefice.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {chantier.marge}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Factures en attente et Dépenses récentes */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Factures en attente */}
          <BlurFade inView delay={0.45}>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Factures en attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {facturesEnAttente.map((facture, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-950/20 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">{facture.client}</p>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          {facture.statut}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-200/70">
                          {format(parseISO(facture.date), "d MMM yyyy", { locale: fr })}
                        </span>
                        <span className="text-lg font-bold text-green-400">€ {facture.montant.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-red-900/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-200/80">Total en attente</span>
                      <span className="text-xl font-bold text-green-400">
                        € {facturesEnAttente.reduce((sum, f) => sum + f.montant, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Dépenses récentes */}
          <BlurFade inView delay={0.5}>
            <Card className="card-3d border border-red-900/40 bg-black/70 text-red-50 backdrop-blur-xl group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Dépenses récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {depensesRecentes.map((depense, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-950/20 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">{depense.prestataire}</p>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {depense.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-200/70">
                          {format(parseISO(depense.date), "d MMM yyyy", { locale: fr })}
                        </span>
                        <span className="text-lg font-bold text-red-400">€ {depense.montant.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-red-900/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-200/80">Total dépenses</span>
                      <span className="text-xl font-bold text-red-400">
                        € {depensesRecentes.reduce((sum, d) => sum + d.montant, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RapportFinancier;

