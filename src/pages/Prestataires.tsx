import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus } from "lucide-react";

const Prestataires = () => {
  const vendors = [
    { name: "Électricité Pro 34", specialty: "Électricité", projects: 3, lastReminder: "10/04/2025" },
    { name: "Plomberie Méditerranée", specialty: "Plomberie", projects: 4, lastReminder: "08/04/2025" },
    { name: "Menuiserie Languedoc", specialty: "Menuiserie", projects: 2, lastReminder: "12/04/2025" },
    { name: "Gros Œuvre Biterrois", specialty: "Gros œuvre", projects: 5, lastReminder: "15/04/2025" },
    { name: "Peinture & Déco 34", specialty: "Peinture", projects: 3, lastReminder: "09/04/2025" },
    { name: "Carrelage Sud", specialty: "Carrelage", projects: 2, lastReminder: "11/04/2025" },
    { name: "Chauffage Climatisation Plus", specialty: "Chauffage", projects: 3, lastReminder: "13/04/2025" },
    { name: "Étanchéité Hérault", specialty: "Étanchéité", projects: 2, lastReminder: "07/04/2025" },
  ];

  const specialties = [
    "Gros œuvre", "Électricité", "Plomberie", "Menuiserie", 
    "Peinture", "Carrelage", "Chauffage", "Étanchéité"
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">
              Prestataires
            </h1>
            <p className="text-muted-foreground">
              Gérez votre réseau de prestataires et intervenants.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un prestataire
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des prestataires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Nom du prestataire</th>
                    <th className="text-left py-3 px-4 font-semibold">Spécialité</th>
                    <th className="text-left py-3 px-4 font-semibold">Chantiers en cours</th>
                    <th className="text-left py-3 px-4 font-semibold">Dernière relance</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{vendor.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{vendor.specialty}</Badge>
                      </td>
                      <td className="py-3 px-4">{vendor.projects}</td>
                      <td className="py-3 px-4">{vendor.lastReminder}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Voir fiche</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Prestataires;
