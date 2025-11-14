import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Clock, ListChecks, LayoutDashboard, FileText, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-foreground">LORD BÂTIMENT</h1>
            <p className="text-sm text-muted-foreground">L'Excellence Appart</p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">Accéder au prototype</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
              Moins de relances.<br />Plus de chantiers livrés à l'heure.
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
              Cet espace de pilotage centralise vos chantiers et automatise les relances de vos prestataires, 
              pour que vous ne soyez plus obligé de tout gérer vous-même.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Découvrir le dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/relances">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  Voir la gestion des relances
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase">
            Nous partons de vos problématiques
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Vos relances prestataires</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Aujourd'hui, vous devez gérer vous-même les mails, appels et confirmations auprès de vos intervenants. 
                  Dans ce prototype, vous voyez en un coup d'œil quelles relances sont à envoyer, et vous pouvez tout déclencher en quelques clics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ListChecks className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Des informations dispersées</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Aujourd'hui, les informations chantier, administratives et financières sont éclatées entre plusieurs outils. 
                  Dans ce prototype, chaque chantier dispose d'une fiche claire avec les principaux éléments regroupés.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Screens Preview */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase">
            Aperçu des écrans
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <LayoutDashboard className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Vue d'ensemble de vos chantiers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Un tableau de bord qui centralise tous vos projets en cours, les alertes et les actions prioritaires.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Détail d'un chantier</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Accédez à toutes les informations d'un chantier : lots, prestataires, avancement, documents et relances.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Relances à automatiser</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Planifiez et envoyez vos relances en quelques clics grâce à des modèles personnalisables.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6 uppercase">
            Voici comment cela pourrait fonctionner pour vous au quotidien
          </h3>
          <Link to="/dashboard">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Accéder au dashboard de démo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Prototype réalisé par <span className="font-semibold">Adimi Agency</span></p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
