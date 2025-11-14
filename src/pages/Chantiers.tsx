import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Users } from "lucide-react";

const Chantiers = () => {
  const projects = [
    { name: "Rénovation Béziers Centre", type: "Rénovation", progress: 65, vendors: 8, status: "En temps" },
    { name: "Programme Neuf Narbonne", type: "Construction", progress: 42, vendors: 12, status: "À surveiller" },
    { name: "Box Stockage ZI Est", type: "Box de stockage", progress: 88, vendors: 5, status: "En temps" },
    { name: "Résidence Les Pins", type: "Promotion", progress: 55, vendors: 10, status: "En retard" },
    { name: "Appartement Montpellier Nord", type: "Location", progress: 73, vendors: 6, status: "En temps" },
    { name: "Rénovation Sète Port", type: "Rénovation", progress: 35, vendors: 7, status: "En temps" },
    { name: "Villa Agde", type: "Construction", progress: 20, vendors: 9, status: "En temps" },
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">
              Chantiers
            </h1>
            <p className="text-muted-foreground">
              Gérez tous vos projets immobiliers en cours.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un chantier
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des chantiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Nom du chantier</th>
                    <th className="text-left py-3 px-4 font-semibold">Type de projet</th>
                    <th className="text-left py-3 px-4 font-semibold">Avancement</th>
                    <th className="text-left py-3 px-4 font-semibold">Nombre de prestataires</th>
                    <th className="text-left py-3 px-4 font-semibold">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
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
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {project.vendors}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(project.status)}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Voir détails</Button>
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

export default Chantiers;
