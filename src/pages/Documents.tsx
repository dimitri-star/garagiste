import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Download } from "lucide-react";

const Documents = () => {
  const documents = [
    { project: "Rénovation Béziers Centre", type: "Devis", title: "Devis Électricité Pro 34", date: "14/04/2025" },
    { project: "Programme Neuf Narbonne", type: "Facture", title: "Facture Gros Œuvre Mars 2025", date: "13/04/2025" },
    { project: "Box Stockage ZI Est", type: "PV de réception", title: "PV Réception Étanchéité", date: "12/04/2025" },
    { project: "Résidence Les Pins", type: "Contrat", title: "Contrat Plomberie Méditerranée", date: "11/04/2025" },
    { project: "Appartement Montpellier Nord", type: "Devis", title: "Devis Carrelage Sud", date: "10/04/2025" },
    { project: "Rénovation Sète Port", type: "Facture", title: "Facture Peinture & Déco 34", date: "09/04/2025" },
    { project: "Villa Agde", type: "Devis", title: "Devis Gros Œuvre Biterrois", date: "08/04/2025" },
    { project: "Programme Neuf Narbonne", type: "PV de réception", title: "PV Réception Gros Œuvre", date: "07/04/2025" },
    { project: "Rénovation Béziers Centre", type: "Contrat", title: "Contrat Menuiserie Languedoc", date: "06/04/2025" },
    { project: "Résidence Les Pins", type: "Facture", title: "Facture Chauffage Climatisation Plus", date: "05/04/2025" },
  ];

  const getTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      "Devis": "bg-blue-100 text-blue-800",
      "Facture": "bg-green-100 text-green-800",
      "PV de réception": "bg-purple-100 text-purple-800",
      "Contrat": "bg-orange-100 text-orange-800",
    };

    return (
      <Badge className={`${colors[type] || "bg-gray-100 text-gray-800"} hover:${colors[type] || "bg-gray-100"}`}>
        {type}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">
              Documents
            </h1>
            <p className="text-muted-foreground">
              Centralisez tous vos documents par chantier.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un document
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tous les documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Chantier</th>
                    <th className="text-left py-3 px-4 font-semibold">Type de document</th>
                    <th className="text-left py-3 px-4 font-semibold">Titre</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{doc.project}</td>
                      <td className="py-3 px-4">{getTypeBadge(doc.type)}</td>
                      <td className="py-3 px-4 font-medium">{doc.title}</td>
                      <td className="py-3 px-4">{doc.date}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
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

export default Documents;
