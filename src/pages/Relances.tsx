import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Mail, MessageSquare, Plus } from "lucide-react";

const Relances = () => {
  const reminders = [
    { date: "15/04/2025", vendor: "Électricité Pro 34", project: "Rénovation Béziers Centre", lot: "Électricité", channel: "Email", status: "Prévue" },
    { date: "15/04/2025", vendor: "Plomberie Méditerranée", project: "Résidence Les Pins", lot: "Plomberie", channel: "WhatsApp", status: "Prévue" },
    { date: "16/04/2025", vendor: "Menuiserie Languedoc", project: "Programme Neuf Narbonne", lot: "Menuiserie", channel: "Email", status: "Prévue" },
    { date: "16/04/2025", vendor: "Gros Œuvre Biterrois", project: "Villa Agde", lot: "Gros œuvre", channel: "Email", status: "Prévue" },
    { date: "17/04/2025", vendor: "Peinture & Déco 34", project: "Rénovation Sète Port", lot: "Peinture", channel: "WhatsApp", status: "Prévue" },
    { date: "13/04/2025", vendor: "Carrelage Sud", project: "Appartement Montpellier Nord", lot: "Carrelage", channel: "Email", status: "Envoyée" },
    { date: "12/04/2025", vendor: "Chauffage Climatisation Plus", project: "Résidence Les Pins", lot: "Chauffage", channel: "Email", status: "Envoyée" },
    { date: "10/04/2025", vendor: "Étanchéité Hérault", project: "Box Stockage ZI Est", lot: "Étanchéité", channel: "WhatsApp", status: "Envoyée" },
  ];

  const templates = [
    {
      name: "Relance début de lot",
      content: `Bonjour {{prenom_prestataire}},

Pour le chantier {{nom_chantier}}, nous souhaitons confirmer votre intervention prévue le {{date_intervention}}.

Pourriez-vous nous confirmer votre disponibilité ?

Cordialement,
{{nom_dirigeant}} – L'Excellence Appart / LORD Bâtiment.`
    },
    {
      name: "Relance retard",
      content: `Bonjour {{prenom_prestataire}},

Concernant le chantier {{nom_chantier}}, nous constatons un retard sur le lot {{nom_lot}}.

Pourriez-vous nous faire un point sur l'avancement et nous indiquer une date de finalisation ?

Merci de votre retour rapide.

Cordialement,
{{nom_dirigeant}} – L'Excellence Appart / LORD Bâtiment.`
    },
    {
      name: "Relance absence de réponse",
      content: `Bonjour {{prenom_prestataire}},

Nous n'avons pas eu de retour de votre part concernant le chantier {{nom_chantier}}.

Pouvez-vous nous confirmer la bonne réception de nos précédents messages et nous tenir informés de l'avancement ?

Dans l'attente de votre retour.

Cordialement,
{{nom_dirigeant}} – L'Excellence Appart / LORD Bâtiment.`
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Prévue":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Prévue</Badge>;
      case "Envoyée":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Envoyée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    return channel === "Email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">
              Relances
            </h1>
            <p className="text-muted-foreground">
              Planifiez et automatisez vos relances prestataires.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Créer une relance
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Relances planifiées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Date prévue</th>
                    <th className="text-left py-3 px-4 font-semibold">Prestataire</th>
                    <th className="text-left py-3 px-4 font-semibold">Chantier</th>
                    <th className="text-left py-3 px-4 font-semibold">Lot</th>
                    <th className="text-left py-3 px-4 font-semibold">Canal</th>
                    <th className="text-left py-3 px-4 font-semibold">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((reminder, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{reminder.date}</td>
                      <td className="py-3 px-4 font-medium">{reminder.vendor}</td>
                      <td className="py-3 px-4">{reminder.project}</td>
                      <td className="py-3 px-4">{reminder.lot}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getChannelIcon(reminder.channel)}
                          <span>{reminder.channel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(reminder.status)}</td>
                      <td className="py-3 px-4">
                        {reminder.status === "Prévue" && (
                          <Button variant="outline" size="sm">Envoyer</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modèles de messages</CardTitle>
            <CardDescription>
              Utilisez ces modèles pour gagner du temps dans vos relances.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {templates.map((template, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{template.name}</h3>
                  <Button variant="outline" size="sm">Utiliser ce modèle</Button>
                </div>
                <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap font-mono">
                  {template.content}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Relances;
