import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertCircle, Clock, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { BlurFade } from "@/components/ui/blur-fade";

const Dashboard = () => {
  const projects = [
    { name: "Rénovation Béziers Centre", type: "Rénovation", progress: 65, status: "En temps", nextDate: "25/04/2025" },
    { name: "Programme Neuf Narbonne", type: "Construction", progress: 42, status: "À surveiller", nextDate: "22/04/2025" },
    { name: "Box Stockage ZI Est", type: "Box de stockage", progress: 88, status: "En temps", nextDate: "18/04/2025" },
    { name: "Résidence Les Pins", type: "Promotion", progress: 55, status: "En retard", nextDate: "20/04/2025" },
    { name: "Appartement Montpellier Nord", type: "Location", progress: 73, status: "En temps", nextDate: "28/04/2025" },
  ];

  const reminders = [
    { vendor: "Électricité Pro 34", project: "Rénovation Béziers Centre", lot: "Électricité", lastContact: "10/04/2025" },
    { vendor: "Plomberie Méditerranée", project: "Résidence Les Pins", lot: "Plomberie", lastContact: "08/04/2025" },
    { vendor: "Menuiserie Languedoc", project: "Programme Neuf Narbonne", lot: "Menuiserie", lastContact: "12/04/2025" },
  ];

  const watchProjects = [
    { name: "Rénovation Béziers Centre", reason: "Aucune mise à jour depuis 10 jours" },
    { name: "Résidence Les Pins", reason: "Date de fin dépassée" },
  ];

  const dailySummary = [
    "Chantier Béziers Centre : relance électricien à prévoir aujourd'hui.",
    "Chantier Box de stockage ZI Est : facture gros œuvre en attente de validation.",
    "Chantier Résidence Les Pins : début de la menuiserie prévu demain.",
  ];

  const recentDocuments = [
    { title: "Devis Électricité - Béziers", type: "Devis", date: "14/04/2025" },
    { title: "Facture Gros Œuvre - Narbonne", type: "Facture", date: "13/04/2025" },
    { title: "PV Réception - Box ZI Est", type: "PV", date: "12/04/2025" },
    { title: "Contrat Plomberie - Les Pins", type: "Contrat", date: "11/04/2025" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En temps":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">En temps</Badge>;
      case "En retard":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">En retard</Badge>;
      case "À surveiller":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">À surveiller</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-red-50">
        <BlurFade inView>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-300">
              Cockpit de pilotage
            </p>
            <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Vue d&apos;ensemble de vos{" "}
              <span className="bg-gradient-to-r from-red-200 via-red-400 to-red-300 bg-clip-text text-transparent">
                projets immobiliers
              </span>
            </h1>
            <p className="text-sm text-red-100/80">
              Chantiers en cours, relances à effectuer, alertes : tout est centralisé ici, dans la continuité de votre
              landing.
            </p>
          </div>
        </BlurFade>

        {/* Projects in Progress */}
        <BlurFade inView delay={0.05}>
          <Card className="border border-red-900/40 bg-black/70 text-red-50 shadow-[0_28px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vos chantiers en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Chantier</th>
                    <th className="text-left py-3 px-4 font-semibold">Type de projet</th>
                    <th className="text-left py-3 px-4 font-semibold">Avancement</th>
                    <th className="text-left py-3 px-4 font-semibold">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold">Prochaine date clé</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{project.name}</td>
                      <td className="py-3 px-4">{project.type}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(project.status)}</td>
                      <td className="py-3 px-4">{project.nextDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          </Card>
        </BlurFade>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Reminders Today */}
          <BlurFade inView delay={0.1}>
            <Card className="border border-red-900/40 bg-black/70 text-red-50 shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Relances à effectuer aujourd'hui
              </CardTitle>
              <CardDescription>
                L'objectif : éviter de passer du temps à chercher qui relancer et avec quel message.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reminders.map((reminder, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{reminder.vendor}</p>
                    <p className="text-sm text-muted-foreground">{reminder.project} - {reminder.lot}</p>
                    <p className="text-xs text-muted-foreground">Dernier contact : {reminder.lastContact}</p>
                  </div>
                  <Button size="sm">Préparer</Button>
                </div>
              ))}
              <Link to="/relances">
                <Button className="w-full" variant="outline">Préparer toutes les relances</Button>
              </Link>
            </CardContent>
            </Card>
          </BlurFade>

          {/* Watch List */}
          <BlurFade inView delay={0.15}>
            <Card className="border border-red-900/40 bg-black/70 text-red-50 shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Chantiers à surveiller
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {watchProjects.map((project, idx) => (
                <div key={idx} className="p-3 border rounded-lg border-orange-200 bg-orange-50">
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">{project.reason}</p>
                </div>
              ))}
            </CardContent>
            </Card>
          </BlurFade>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Daily Summary */}
          <BlurFade inView delay={0.2}>
            <Card className="border border-red-900/40 bg-black/70 text-red-50 shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Résumé de votre journée</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dailySummary.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            </Card>
          </BlurFade>

          {/* Recent Documents */}
          <BlurFade inView delay={0.25}>
            <Card className="border border-red-900/40 bg-black/70 text-red-50 shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Derniers documents ajoutés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{doc.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            </Card>
          </BlurFade>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
