import { useState, useMemo, useEffect, ReactNode } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  Plus,
  Search,
  FileText,
  User,
  Car,
  Calendar,
  Euro,
  Edit,
  Copy,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Wrench,
  Package,
  FileEdit,
  Trash2,
  List,
  Grid3x3,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Devis {
  id: string;
  numero: string;
  date: string;
  clientId: string;
  clientNom: string;
  vehiculeId: string;
  vehiculeImmat: string;
  montantHT: number;
  montantTTC: number;
  tva: number;
  remise: number;
  remiseType: "pourcent" | "montant";
  statut: "brouillon" | "généré" | "envoyé" | "accepté" | "refusé" | "à relancer";
  lignes: LigneDevis[];
  commentaires?: string;
  pdf_url?: string;
}

interface LigneDevis {
  id: string;
  type: "prestation" | "piece" | "libre";
  designation: string;
  reference?: string;
  quantite: number;
  temps?: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  totalHT: number;
}

interface Client {
  id: string;
  nom: string;
  type: "particulier" | "pro";
  email?: string;
  telephone?: string;
}

interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  clientId: string;
}

interface Prestation {
  id: string;
  designation: string;
  temps: number;
  prixHT: number;
  categorie: string;
}

interface Piece {
  id: string;
  designation: string;
  reference: string;
  prixAchat: number;
  coefficient: number;
  prixVente: number;
}

// Composant pour les colonnes droppables du Kanban
function KanbanColumn({ 
  id, 
  children, 
  title, 
  count, 
  total, 
  headerClassName,
  contentClassName,
  borderColor
}: { 
  id: string;
  children: ReactNode;
  title: string;
  count: number;
  total: number;
  headerClassName?: string;
  contentClassName?: string;
  borderColor?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const borderClass = borderColor || 'border-gray-200';

  return (
    <div className="flex flex-col">
      <div className={`${headerClassName || 'bg-gray-100'} p-3 rounded-t-lg border ${borderClass}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
          <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30 text-xs">
            {count}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 font-medium">
          {total.toLocaleString()} €
        </p>
      </div>
      <div 
        ref={setNodeRef}
        className={`flex-1 ${contentClassName || 'bg-gray-50/50'} border-x border-b ${borderClass} rounded-b-lg p-3 min-h-[400px] max-h-[600px] overflow-y-auto ${isOver ? 'bg-opacity-80 ring-2 ring-blue-400' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}

// Composant pour les cartes sortables du Kanban
function SortableDevisCard({ devis, onEdit, onSend, onDelete }: { 
  devis: Devis; 
  onEdit: (devis: Devis) => void;
  onSend: (devisId: string) => void;
  onDelete: (devisId: string, devisNumero: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: devis.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      data-id={devis.id}
    >
      <Card
        className="border bg-white hover:shadow-md transition-all mb-3 cursor-move"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(devis);
        }}
      >
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm text-gray-900">{devis.numero}</p>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">{devis.clientNom}</span>
              </div>
              <div className="flex items-center gap-1">
                <Car className="h-3 w-3" />
                <span>{devis.vehiculeImmat}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-bold text-gray-900">
                {devis.montantTTC.toLocaleString()} € TTC
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {devis.pdf_url && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(devis.pdf_url, '_blank');
                  }}
                  className="h-7 px-2 text-xs hover:bg-blue-50 text-blue-600"
                  title="Ouvrir le PDF"
                >
                  <FileText className="h-3 w-3" />
                </Button>
              )}
              {devis.statut !== "envoyé" && devis.statut !== "accepté" && devis.statut !== "refusé" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSend(devis.id);
                  }}
                  className="h-7 px-2 text-xs hover:bg-green-50 text-green-600"
                  title="Envoyer par email"
                >
                  <Send className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(devis.id, devis.numero);
                }}
                className="h-7 px-2 text-xs hover:bg-red-50 text-red-600"
                title="Supprimer le devis"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const Devis = () => {
  const [viewMode, setViewMode] = useState<"liste" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [hoveredDevisId, setHoveredDevisId] = useState<string | null>(null);
  
  // États pour la modal d'envoi d'email
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailDevis, setEmailDevis] = useState<Devis | null>(null);
  const [emailClient, setEmailClient] = useState<{ nom: string; email: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  
  // États pour les données depuis Supabase
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalDevis, setTotalDevis] = useState(0);

  // État du formulaire de devis
  const [formClientId, setFormClientId] = useState<string>("");
  const [formVehiculeId, setFormVehiculeId] = useState<string>("");
  const [formLignes, setFormLignes] = useState<LigneDevis[]>([]);
  const [activeLigneTab, setActiveLigneTab] = useState<"prestations" | "pieces">("prestations");
  const [formRemise, setFormRemise] = useState(0);
  const [formRemiseType, setFormRemiseType] = useState<"pourcent" | "montant">("pourcent");
  const [formCommentaires, setFormCommentaires] = useState("");
  const [formStatut, setFormStatut] = useState<Devis["statut"]>("brouillon");

  // États pour la progression de création
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Charger les clients depuis Supabase
  useEffect(() => {
    const loadClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('statut', 'actif')
        .order('nom');
      
      if (error) {
        console.error('Erreur chargement clients:', error);
        toast.error('Erreur', { description: 'Impossible de charger les clients' });
      } else {
        setClients(data?.map(c => ({
          id: c.id,
          nom: c.nom,
          type: c.type as "particulier" | "pro",
          email: c.email || "",
          telephone: c.telephone || "",
        })) || []);
      }
    };
    loadClients();
  }, []);

  // Charger les véhicules depuis Supabase
  useEffect(() => {
    const loadVehicules = async () => {
      const { data, error } = await supabase
        .from('vehicules')
        .select('*')
        .order('immatriculation');
      
      if (error) {
        console.error('Erreur chargement véhicules:', error);
      } else {
        setVehicules(data?.map(v => ({
          id: v.id,
          immatriculation: v.immatriculation,
          marque: v.marque,
          modele: v.modele,
          clientId: v.client_id,
        })) || []);
      }
    };
    loadVehicules();
  }, []);

  // Fonction réutilisable pour charger les devis depuis Supabase
  const loadDevisFromSupabase = async (offset?: number, limit?: number) => {
    // Construire la requête de base
    let query = supabase
        .from('devis')
        .select(`
          *,
          clients:client_id (id, nom, email, telephone),
          vehicules:vehicule_id (id, immatriculation, marque, modele)
      `, { count: 'exact' })
        .order('date', { ascending: false });

    // Appliquer les filtres côté serveur (uniquement en vue liste)
    if (viewMode === "liste") {
      // Filtre par statut
      if (statutFilter !== "all") {
        query = query.eq('statut', statutFilter);
      }

      // Filtre par client
      if (clientFilter !== "all") {
        query = query.eq('client_id', clientFilter);
      }

      // Filtre par recherche (sur le numéro, nom client via join, ou immatriculation via join)
      // Note: Pour la recherche textuelle sur les relations, on devra filtrer côté client
      // car Supabase ne permet pas facilement de faire des recherches LIKE sur les relations
    }

    // Ajouter la pagination si spécifiée (uniquement pour la vue liste)
    if (viewMode === "liste" && offset !== undefined && limit !== undefined) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: devisData, error: devisError, count } = await query;

      if (devisError) {
        console.error('Erreur chargement devis:', devisError);
      throw new Error(`Impossible de charger les devis: ${devisError.message}`);
    }

    // Mettre à jour le total pour la pagination (uniquement en vue liste)
    if (viewMode === "liste" && count !== null) {
      setTotalDevis(count);
    } else if (viewMode === "kanban") {
      // En vue Kanban, charger tout sans pagination
      setTotalDevis(devisData?.length || 0);
      }

      // Charger les lignes pour chaque devis
      const devisWithLignes = await Promise.all(
        (devisData || []).map(async (d: any) => {
          const { data: lignesData } = await supabase
            .from('lignes_devis')
            .select('*')
            .eq('devis_id', d.id)
            .order('ordre');

          const client = Array.isArray(d.clients) ? d.clients[0] : d.clients;
          const vehicule = Array.isArray(d.vehicules) ? d.vehicules[0] : d.vehicules;

          return {
            id: d.id,
            numero: d.numero,
            date: d.date,
            clientId: d.client_id,
            clientNom: client?.nom || '',
            vehiculeId: d.vehicule_id,
            vehiculeImmat: vehicule?.immatriculation || '',
            montantHT: Number(d.montant_ht),
            montantTTC: Number(d.montant_ttc),
            tva: Number(d.tva),
            remise: Number(d.remise),
            remiseType: d.remise_type,
            statut: d.statut,
            lignes: (lignesData || []).map((l: any) => ({
              id: l.id,
              type: l.type,
              designation: l.designation,
              reference: l.reference || undefined,
              quantite: Number(l.quantite),
              temps: l.temps ? Number(l.temps) : undefined,
              prixUnitaireHT: Number(l.prix_unitaire_ht),
              tauxTVA: Number(l.taux_tva),
              totalHT: Number(l.total_ht),
            })),
            commentaires: d.commentaires || undefined,
            pdf_url: d.pdf_url || undefined,
          };
        })
      );

    return devisWithLignes;
  };

  // Charger les devis depuis Supabase
  useEffect(() => {
    const loadDevis = async () => {
      setLoading(true);
      try {
        if (viewMode === "liste") {
          // En vue liste, charger avec pagination
          const offset = (currentPage - 1) * itemsPerPage;
          const devisWithLignes = await loadDevisFromSupabase(offset, itemsPerPage);
      setDevis(devisWithLignes);
        } else {
          // En vue Kanban, charger tout sans pagination
          const devisWithLignes = await loadDevisFromSupabase();
          setDevis(devisWithLignes);
        }
      } catch (error: any) {
        toast.error('Erreur', { description: error.message || 'Impossible de charger les devis' });
      } finally {
      setLoading(false);
      }
    };
    loadDevis();
  }, [currentPage, viewMode, statutFilter, clientFilter]);

  // Réinitialiser à la page 1 quand on change de mode de vue ou de filtres
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, statutFilter, clientFilter]);

  const prestations: Prestation[] = [
    { id: "p1", designation: "Vidange moteur", temps: 0.5, prixHT: 45, categorie: "Entretien" },
    { id: "p2", designation: "Remplacement courroie de distribution", temps: 2, prixHT: 180, categorie: "Réparation" },
    { id: "p3", designation: "Remplacement plaquettes de frein avant", temps: 1, prixHT: 80, categorie: "Freinage" },
    { id: "p4", designation: "Révision complète", temps: 1.5, prixHT: 120, categorie: "Entretien" },
  ];

  const pieces: Piece[] = [
    { id: "pc1", designation: "Filtre à huile", reference: "FIL-123", prixAchat: 8, coefficient: 2.5, prixVente: 20 },
    { id: "pc2", designation: "Courroie distribution", reference: "CRB-456", prixAchat: 45, coefficient: 2, prixVente: 90 },
    { id: "pc3", designation: "Plaquettes frein avant", reference: "PLQ-789", prixAchat: 25, coefficient: 2.5, prixVente: 62.5 },
    { id: "pc4", designation: "Huile moteur 5W30", reference: "HUI-012", prixAchat: 35, coefficient: 1.8, prixVente: 63 },
  ];

  // Fonction pour générer le PDF (ne s'exécute que si URL fournie)
  const generateDevisPDF = async (devisId: string) => {
    const MAKE_GENERATE_URL = "https://hook.eu2.make.com/43oaprigwnfqgmqr1s1934dg4sb8cb67";
    
    if (!MAKE_GENERATE_URL) {
      return; // Ne rien faire si l'URL n'est pas configurée
    }

    try {
      // Charger le devis complet avec client et véhicule
      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .select(`
          *,
          clients:client_id (id, nom, email, telephone),
          vehicules:vehicule_id (id, immatriculation, marque, modele)
        `)
        .eq('id', devisId)
        .single();

      if (devisError || !devisData) {
        throw new Error('Devis introuvable');
      }

      const { data: lignesData } = await supabase
        .from('lignes_devis')
        .select('*')
        .eq('devis_id', devisId)
        .order('ordre');

      const client = Array.isArray(devisData.clients) ? devisData.clients[0] : devisData.clients;
      const vehicule = Array.isArray(devisData.vehicules) ? devisData.vehicules[0] : devisData.vehicules;

      const response = await fetch(MAKE_GENERATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          devis_id: devisId,
          client: {
            id: client?.id,
            nom: client?.nom,
            email: client?.email || "",
            telephone: client?.telephone || "",
          },
          vehicule: {
            id: vehicule?.id,
            immatriculation: vehicule?.immatriculation,
            marque: vehicule?.marque,
            modele: vehicule?.modele,
          },
          prestations: lignesData || [],
          totaux: {
            montantHT: Number(devisData.montant_ht),
            montantTTC: Number(devisData.montant_ttc),
            tva: Number(devisData.tva),
            remise: Number(devisData.remise),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.pdf_url) {
        await supabase
          .from('devis')
          .update({
            pdf_url: result.pdf_url,
            statut: 'généré',
          })
          .eq('id', devisId);

        // Recharger les devis
        const { data: updatedDevis } = await supabase
          .from('devis')
          .select('*')
          .eq('id', devisId)
          .single();

        if (updatedDevis) {
          setDevis(prev => prev.map(d => 
            d.id === devisId 
              ? { ...d, pdf_url: result.pdf_url, statut: 'généré' as const }
              : d
          ));
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la génération du PDF:', error);
      // Ne pas afficher d'erreur à l'utilisateur
    }
  };

  // Fonction pour ouvrir la modal de prévisualisation d'email
  const openEmailDialog = async (devisId: string) => {
    try {
      // Trouver le devis dans la liste actuelle
      const devisToSend = devis.find(d => d.id === devisId);
      
      if (!devisToSend) {
        toast.error("Erreur", {
          description: "Devis introuvable",
        });
        return;
      }

      if (!devisToSend.pdf_url) {
        toast.error("Erreur", {
          description: "Le PDF du devis n'est pas encore disponible",
        });
        return;
      }

      // Charger les informations complètes du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('nom, email')
        .eq('id', devisToSend.clientId)
        .single();

      if (clientError || !clientData) {
        toast.error("Erreur", {
          description: "Impossible de charger les informations du client",
        });
        return;
      }

      if (!clientData.email) {
        toast.error("Erreur", {
          description: "L'email du client n'est pas renseigné",
        });
        return;
      }

      // Préparer le sujet et le corps de l'email
      const subject = `Devis ${devisToSend.numero} - ${clientData.nom}`;
      const body = `Bonjour ${clientData.nom},

Nous vous adressons le devis ${devisToSend.numero} pour votre véhicule ${devisToSend.vehiculeImmat}.

Détails du devis :
- Numéro : ${devisToSend.numero}
- Date : ${new Date(devisToSend.date).toLocaleDateString('fr-FR')}
- Montant TTC : ${devisToSend.montantTTC.toLocaleString('fr-FR')} €

Le devis est joint à cet email en pièce jointe.

Cordialement,
L'équipe LS MECA`;

      // Ouvrir la modal avec les données pré-remplies
      setEmailDevis(devisToSend);
      setEmailClient({ nom: clientData.nom, email: clientData.email });
      setEmailSubject(subject);
      setEmailBody(body);
      setIsEmailDialogOpen(true);
    } catch (error: any) {
      console.error('Erreur lors de l\'ouverture de la modal:', error);
      toast.error("Erreur", {
        description: error.message || "Une erreur est survenue",
      });
    }
  };

  // Fonction pour envoyer réellement l'email
  const handleSendEmail = async () => {
    if (!emailDevis || !emailClient) {
      return;
    }

    const MAKE_SEND_URL = import.meta.env.VITE_MAKE_SEND_URL || "https://hook.eu2.make.com/ytxwodg9b8xfq5etaspn5kt8bk5tm5p9";

    try {
      // Envoyer l'email via Make.com
      const response = await fetch(MAKE_SEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          devis_id: emailDevis.id,
          email: emailClient.email,
          pdf_url: emailDevis.pdf_url,
          subject: emailSubject,
          body: emailBody,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mettre à jour le statut du devis
      await supabase
        .from('devis')
        .update({ statut: 'envoyé' })
        .eq('id', emailDevis.id);

      // Mettre à jour l'état local
      setDevis(prev => prev.map(d => 
        d.id === emailDevis.id 
          ? { ...d, statut: 'envoyé' as const }
          : d
      ));

      // Fermer la modal
      setIsEmailDialogOpen(false);
      setEmailDevis(null);
      setEmailClient(null);
      setEmailSubject("");
      setEmailBody("");

      toast.success("Devis envoyé", {
        description: `Le devis a été envoyé à ${emailClient.email}`,
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error("Erreur", {
        description: error.message || "Une erreur est survenue lors de l'envoi",
      });
    }
  };

  // Fonction pour envoyer le devis par email (ouvre la modal)
  const sendDevisByEmail = (devisId: string) => {
    openEmailDialog(devisId);
  };

  const getFilteredDevis = () => {
    let filtered = devis;

    // En vue liste, les filtres statut et client sont déjà appliqués côté serveur
    // On ne les applique que pour la vue Kanban
    if (viewMode === "kanban") {
    // Filtre par statut
    if (statutFilter !== "all") {
      filtered = filtered.filter((d) => d.statut === statutFilter);
    }

    // Filtre par client
    if (clientFilter !== "all") {
      filtered = filtered.filter((d) => d.clientId === clientFilter);
      }
    }

    // Filtre par recherche (toujours côté client car il concerne les relations)
    // En vue liste, la recherche filtre uniquement sur les devis de la page actuelle
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.numero.toLowerCase().includes(query) ||
          d.clientNom.toLowerCase().includes(query) ||
          d.vehiculeImmat.toLowerCase().includes(query)
      );
    }

    // En vue liste, retourner tous les devis si pas de recherche (ils sont déjà filtrés côté serveur)
    return filtered;
  };

  const filteredDevis = getFilteredDevis();

  // Grouper les devis par statut pour le Kanban
  const devisByStatut = useMemo(() => {
    const groupes: Record<string, Devis[]> = {
      brouillon: [],
      généré: [],
      envoyé: [],
      accepté: [],
      refusé: [],
      "à relancer": [],
    };

    filteredDevis.forEach((devis) => {
      if (groupes[devis.statut]) {
        groupes[devis.statut].push(devis);
      }
    });

    return groupes;
  }, [filteredDevis]);

  // Calculer les totaux par colonne Kanban
  const totauxKanban = useMemo(() => {
    return {
      brouillon: devisByStatut.brouillon.reduce((sum, d) => sum + d.montantTTC, 0),
      généré: devisByStatut.généré.reduce((sum, d) => sum + d.montantTTC, 0),
      envoyé: devisByStatut.envoyé.reduce((sum, d) => sum + d.montantTTC, 0),
      accepté: devisByStatut.accepté.reduce((sum, d) => sum + d.montantTTC, 0),
      refusé: devisByStatut.refusé.reduce((sum, d) => sum + d.montantTTC, 0),
      "à relancer": devisByStatut["à relancer"].reduce((sum, d) => sum + d.montantTTC, 0),
    };
  }, [devisByStatut]);

  // Configuration du drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Gestion du drag & drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setDragOffset(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOffset(null);

    if (!over) return;

    const devisId = String(active.id);
    
    // Détecter le statut cible : over.id peut être le statut de la colonne ou l'id d'une carte
    let newStatut: Devis["statut"] | null = null;
    
    // Liste des statuts valides
    const statutsValides: Devis["statut"][] = ["brouillon", "généré", "envoyé", "accepté", "refusé", "à relancer"];
    
    // Si over.id est un statut valide, c'est la colonne cible
    if (statutsValides.includes(over.id as Devis["statut"])) {
      newStatut = over.id as Devis["statut"];
    } else {
      // Sinon, trouver dans quelle colonne se trouve la carte over
      const overDevis = devis.find(d => d.id === String(over.id));
      if (overDevis) {
        newStatut = overDevis.statut;
      } else {
        return; // Pas de colonne valide trouvée
      }
    }

    // Trouver le devis actuel
    const currentDevis = devis.find(d => d.id === devisId);
    if (!currentDevis || currentDevis.statut === newStatut) return;

    try {
      // Mettre à jour dans Supabase
      const { error } = await supabase
        .from('devis')
        .update({ statut: newStatut })
        .eq('id', devisId);

      if (error) throw error;

      // Mettre à jour l'état local
      setDevis(prev => prev.map(d => 
        d.id === devisId 
          ? { ...d, statut: newStatut }
          : d
      ));

      // Si le statut devient "envoyé", appeler sendDevisByEmail
      if (newStatut === "envoyé") {
        sendDevisByEmail(devisId);
      }

      toast.success("Statut mis à jour", {
        description: `Le devis a été déplacé vers "${newStatut}"`,
      });
    } catch (error: any) {
      toast.error("Erreur", {
        description: error.message || "Impossible de mettre à jour le statut",
      });
    }
  };

  const vehiculesFiltres = formClientId
    ? vehicules.filter((v) => v.clientId === formClientId)
    : vehicules;

  const calculerTotaux = () => {
    const sousTotalPrestations = formLignes
      .filter((l) => l.type === "prestation")
      .reduce((sum, l) => sum + l.totalHT, 0);
    const sousTotalPieces = formLignes
      .filter((l) => l.type === "piece")
      .reduce((sum, l) => sum + l.totalHT, 0);
    const totalHT = sousTotalPrestations + sousTotalPieces;
    const remiseMontant =
      formRemiseType === "pourcent" ? (totalHT * formRemise) / 100 : formRemise;
    const totalHTAvecRemise = totalHT - remiseMontant;
    const tva = totalHTAvecRemise * 0.2;
    const totalTTC = totalHTAvecRemise + tva;

    return {
      sousTotalPrestations,
      sousTotalPieces,
      totalHT,
      remiseMontant,
      totalHTAvecRemise,
      tva,
      totalTTC,
    };
  };


  const totaux = calculerTotaux();

  const handleAjouterPrestation = (prestation: Prestation) => {
    const nouvelleLigne: LigneDevis = {
      id: `ligne-${Date.now()}`,
      type: "prestation",
      designation: prestation.designation,
      quantite: 1,
      temps: prestation.temps,
      prixUnitaireHT: prestation.prixHT,
      tauxTVA: 20,
      totalHT: prestation.prixHT,
    };
    setFormLignes([...formLignes, nouvelleLigne]);
  };

  const handleAjouterPiece = (piece: Piece) => {
    const nouvelleLigne: LigneDevis = {
      id: `ligne-${Date.now()}`,
      type: "piece",
      designation: piece.designation,
      reference: piece.reference,
      quantite: 1,
      prixUnitaireHT: piece.prixVente,
      tauxTVA: 20,
      totalHT: piece.prixVente,
    };
    setFormLignes([...formLignes, nouvelleLigne]);
  };

  const handleAjouterLigneLibre = () => {
    const nouvelleLigne: LigneDevis = {
      id: `ligne-${Date.now()}`,
      type: "libre",
      designation: "",
      quantite: 1,
      prixUnitaireHT: 0,
      tauxTVA: 20,
      totalHT: 0,
    };
    setFormLignes([...formLignes, nouvelleLigne]);
  };

  const handleModifierLigne = (id: string, updates: Partial<LigneDevis>) => {
    setFormLignes(
      formLignes.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...updates };
          updated.totalHT = updated.quantite * updated.prixUnitaireHT;
          return updated;
        }
        return l;
      })
    );
  };

  const handleSupprimerLigne = (id: string) => {
    setFormLignes(formLignes.filter((l) => l.id !== id));
  };

  const handleNouveauDevis = () => {
    setFormClientId("");
    setFormVehiculeId("");
    setFormLignes([]);
    setFormRemise(0);
    setFormRemiseType("pourcent");
    setFormCommentaires("");
    setFormStatut("brouillon");
    setIsCreateSheetOpen(true);
  };

  const handleEditDevis = (devis: Devis) => {
    setSelectedDevis(devis);
    setFormClientId(devis.clientId);
    setFormVehiculeId(devis.vehiculeId);
    setFormLignes([...devis.lignes]);
    setFormRemise(devis.remise);
    setFormRemiseType(devis.remiseType);
    setFormCommentaires(devis.commentaires || "");
    setFormStatut(devis.statut);
    setIsEditSheetOpen(true);
  };

  const handleDupliquerDevis = (devis: Devis) => {
    setFormClientId(devis.clientId);
    setFormVehiculeId(devis.vehiculeId);
    setFormLignes([...devis.lignes]);
    setFormRemise(devis.remise);
    setFormRemiseType(devis.remiseType);
    setFormCommentaires(devis.commentaires || "");
    setFormStatut("brouillon");
    setIsCreateSheetOpen(true);
  };

  const handleTransformerEnFacture = (devisId: string) => {
    console.log("Transformer devis en facture", devisId);
  };

  // Fonction pour supprimer un devis
  const handleDeleteDevis = async (devisId: string, devisNumero: string) => {
    // Confirmation avant suppression
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le devis ${devisNumero} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      console.log('Début suppression devis dans table devis:', { devisId, devisNumero });

      // Supprimer directement le devis dans la table devis
      // Supabase devrait gérer automatiquement la suppression en cascade des lignes_devis
      // si la contrainte de clé étrangère est configurée avec ON DELETE CASCADE
      const { error: devisError, data: deletedData, count } = await supabase
        .from('devis')
        .delete({ count: 'exact' })
        .eq('id', devisId)
        .select();

      console.log('Résultat suppression:', { error: devisError, count, deletedData });

      // Si erreur explicite, afficher l'erreur
      if (devisError) {
        console.error('Erreur Supabase lors de la suppression du devis:', devisError);
        
        // Déterminer le message d'erreur approprié
        let errorMessage = "Impossible de supprimer le devis.";
        if (devisError.code === '42501') {
          errorMessage = "Permissions insuffisantes (RLS). Vérifiez les politiques Row Level Security dans Supabase pour permettre la suppression sur la table 'devis'.";
        } else if (devisError.code === '23503') {
          errorMessage = "Le devis ne peut pas être supprimé car il est référencé ailleurs.";
        } else {
          errorMessage = `${devisError.message || errorMessage} (Code: ${devisError.code || 'inconnu'})`;
        }

        throw new Error(errorMessage);
      }

      // Vérifier que la suppression a réellement eu lieu dans la table devis
      // Si count est 0, c'est que rien n'a été supprimé (probablement RLS qui bloque)
      if (count === 0) {
        console.warn('Aucun devis supprimé (count: 0). Vérification de l\'existence...');
        
        // Vérifier si le devis existe toujours dans la table devis
        const { data: stillExists, error: verifyError } = await supabase
          .from('devis')
          .select('id, numero')
          .eq('id', devisId)
          .maybeSingle();

        if (verifyError) {
          console.error('Erreur lors de la vérification après suppression:', verifyError);
          throw new Error("Erreur lors de la vérification de la suppression. Veuillez actualiser la page.");
        }

        if (stillExists) {
          // Le devis existe toujours dans la table devis - la suppression a échoué (probablement RLS)
          console.error(`Le devis ${devisId} (${stillExists.numero}) existe toujours dans la table devis après tentative de suppression.`);
          throw new Error(`La suppression a échoué. Le devis ${devisNumero} existe toujours dans Supabase. Vérifiez les politiques Row Level Security (RLS) pour la table 'devis' qui bloquent probablement la suppression.`);
        } else {
          // Le devis n'existe plus - la suppression a réussi malgré count = 0
          console.log('Suppression réussie (vérifiée). Le devis n\'existe plus dans la table devis.');
        }
      } else if (count > 0) {
        // count > 0 signifie qu'au moins un devis a été supprimé - succès
        console.log(`Suppression réussie. ${count} devis supprimé(s) de la table devis.`, deletedData);
      }

      // 4. Mettre à jour l'UI SEULEMENT après confirmation de succès
      if (viewMode === "liste") {
        const currentDevisCount = devis.length;
        // Si on supprime le dernier devis de la page et qu'on n'est pas sur la première page
        if (currentDevisCount === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Recharger la page actuelle
          setLoading(true);
          try {
            const offset = (currentPage - 1) * itemsPerPage;
            const devisWithLignes = await loadDevisFromSupabase(offset, itemsPerPage);
          setDevis(devisWithLignes);
          } catch (reloadError: any) {
            console.error('Erreur lors du rechargement après suppression:', reloadError);
            setCurrentPage(currentPage); // Force le rechargement via useEffect
          } finally {
            setLoading(false);
          }
        }
      } else {
        // En vue Kanban, recharger tout
        setLoading(true);
        try {
          const devisWithLignes = await loadDevisFromSupabase();
          setDevis(devisWithLignes);
        } catch (reloadError: any) {
          console.error('Erreur lors du rechargement après suppression:', reloadError);
        } finally {
          setLoading(false);
        }
      }
      
      // 5. Afficher une notification de succès
      toast.success("Devis supprimé", {
        description: `Le devis ${devisNumero} a été supprimé avec succès.`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Erreur complète lors de la suppression du devis:', error);
      
      // Recharger depuis Supabase pour s'assurer d'avoir l'état le plus récent
      setLoading(true);
      try {
        if (viewMode === "liste") {
          const offset = (currentPage - 1) * itemsPerPage;
          const devisWithLignes = await loadDevisFromSupabase(offset, itemsPerPage);
          setDevis(devisWithLignes);
        } else {
          const devisWithLignes = await loadDevisFromSupabase();
          setDevis(devisWithLignes);
        }
      } catch (reloadError: any) {
        console.error('Erreur lors du rechargement après échec de suppression:', reloadError);
      } finally {
        setLoading(false);
      }
      
      // Afficher une notification d'erreur détaillée
      toast.error("Erreur lors de la suppression", {
        description: error.message || "Une erreur inattendue s'est produite. Consultez la console pour plus de détails.",
        duration: 6000,
      });
    }
  };

  // Fonction pour générer le prochain numéro de devis incrémental (DEV-2025-1, DEV-2025-2, etc.)
  const generateNextDevisNumber = async (year: number): Promise<string> => {
    try {
      // Récupérer tous les devis de l'année en cours
      const { data: devisData, error } = await supabase
        .from('devis')
        .select('numero')
        .like('numero', `DEV-${year}-%`);

      if (error) {
        console.error('Erreur lors de la récupération des numéros de devis:', error);
        // En cas d'erreur, utiliser un numéro basé sur le timestamp comme fallback
        return `DEV-${year}-${String(Date.now()).slice(-6)}`;
      }

      // Extraire les numéros et trouver le maximum
      let maxNumber = 0;
      
      if (devisData && devisData.length > 0) {
        devisData.forEach((devis: { numero: string }) => {
          // Format attendu: DEV-2025-123
          const match = devis.numero.match(new RegExp(`DEV-${year}-(\\d+)`));
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNumber) {
              maxNumber = num;
            }
          }
        });
      }

      // Incrémenter pour obtenir le prochain numéro
      const nextNumber = maxNumber + 1;
      
      return `DEV-${year}-${nextNumber}`;
    } catch (error) {
      console.error('Erreur lors de la génération du numéro de devis:', error);
      // Fallback en cas d'erreur
      return `DEV-${year}-${String(Date.now()).slice(-6)}`;
    }
  };

  const handleSauvegarder = async () => {
    if (!formClientId || !formVehiculeId || formLignes.length === 0) {
      toast.error("Données incomplètes", {
        description: "Veuillez remplir le client, le véhicule et ajouter au moins une ligne.",
      });
      return;
    }

    // Si c'est une édition, utiliser l'ancienne logique (sans progression)
    if (isEditSheetOpen) {
      // TODO: Implémenter la logique d'édition si nécessaire
      toast.error("Édition", {
        description: "L'édition des devis n'est pas encore implémentée.",
      });
      return;
    }

    // Si c'est une création, utiliser la logique avec progression
    try {
      setIsGenerating(true);
      setProgress(0);
      setStatusMessage("Préparation des données...");

      const client = clients.find(c => c.id === formClientId);
      const vehicule = vehicules.find(v => v.id === formVehiculeId);
      
      if (!client || !vehicule) {
        throw new Error("Client ou véhicule introuvable.");
      }

      const totaux = calculerTotaux();
      
      // Générer un numéro de devis incrémental (DEV-2025-1, DEV-2025-2, etc.)
      setProgress(5);
      setStatusMessage("Génération du numéro de devis...");
      
      const currentYear = new Date().getFullYear();
      const numeroDevis = await generateNextDevisNumber(currentYear);

      // Générer un ID pour le devis (sera utilisé dans le webhook et pour créer le devis)
      const devisId = crypto.randomUUID();

      // ÉTAPE 1 : Appeler le workflow Make.com D'ABORD (avant de créer le devis)
      setProgress(10);
      setStatusMessage("Lancement du workflow Make.com...");

      const WEBHOOK_URL = "https://hook.eu2.make.com/43oaprigwnfqgmqr1s1934dg4sb8cb67";
      
      if (!WEBHOOK_URL) {
        throw new Error("URL du webhook Make.com non configurée. Veuillez configurer l'URL du webhook.");
      }

      // Préparer le payload pour le webhook avec le devisId
      const webhookPayload = {
        devisId: devisId,
        numeroDevis: numeroDevis,
        client: {
          id: client.id,
          nom: client.nom,
          email: client.email || "",
          telephone: client.telephone || "",
        },
        vehicule: {
          id: vehicule.id,
          immatriculation: vehicule.immatriculation,
          marque: vehicule.marque,
          modele: vehicule.modele,
        },
        lignes: formLignes,
        totaux: {
          sousTotalPrestations: totaux.sousTotalPrestations,
          sousTotalPieces: totaux.sousTotalPieces,
          totalHT: totaux.totalHTAvecRemise,
          tva: totaux.tva,
          remise: formRemise,
          remiseType: formRemiseType,
          totalTTC: totaux.totalTTC,
        },
        commentaires: formCommentaires || "",
      };

      console.log('ÉTAPE 1 : Appel du workflow Make.com AVANT création du devis');
      console.log('URL webhook:', WEBHOOK_URL);
      console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

      // Animation de progression pendant l'appel du workflow
      setProgress(20);
      setStatusMessage("Workflow Make.com en cours...");
      
      let webhookRes;
      let workflowSuccess = false;
      
      try {
        // Appel du webhook avec timeout plus long (60 secondes pour laisser le workflow se terminer)
        webhookRes = await fetch(WEBHOOK_URL, {
        method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        body: JSON.stringify(webhookPayload),
          // Timeout de 60 secondes pour laisser le temps au workflow de se terminer
          signal: AbortSignal.timeout(60000),
        });

        console.log('Réponse webhook Make.com - Status:', webhookRes.status, 'OK:', webhookRes.ok);
        console.log('Headers réponse:', Object.fromEntries(webhookRes.headers.entries()));
        
        // Lire le corps de la réponse
        let responseBody = '';
        try {
          responseBody = await webhookRes.clone().text();
          console.log('Corps de la réponse webhook:', responseBody);
        } catch (e) {
          console.warn('Impossible de lire le corps de la réponse');
        }

        // Vérifier si le workflow s'est terminé avec succès
        // Les codes 200, 201, 202, 204 sont considérés comme succès
        const successCodes = [200, 201, 202, 204];
        workflowSuccess = webhookRes.ok || successCodes.includes(webhookRes.status);

        // Parser la réponse du webhook pour vérifier le statut
        let webhookResponse: any = null;
        try {
          if (responseBody) {
            webhookResponse = JSON.parse(responseBody);
          }
        } catch (e) {
          // Si ce n'est pas du JSON, ce n'est pas grave
          console.log('Réponse webhook non-JSON:', responseBody);
        }

        // Vérifier si la réponse indique un succès (même avec une erreur de contrainte unique)
        if (webhookResponse?.success === false || webhookResponse?.error) {
          // Si le webhook retourne explicitement une erreur, on la gère
          const errorMsg = webhookResponse.error || webhookResponse.message || "Erreur inconnue";
          
          // Si l'erreur est liée à une contrainte unique (devis existant), on considère ça comme un succès
          if (
            errorMsg.includes('duplicate key') || 
            errorMsg.includes('unique constraint') || 
            errorMsg.includes('devis_pkey') ||
            webhookResponse.errorType === 'duplicate_key'
          ) {
            console.log('ℹ️ Le devis existe déjà, ce qui est normal pour un upsert. C\'est considéré comme un succès.');
            workflowSuccess = true;
          } else {
            // Autre type d'erreur
            throw new Error(errorMsg);
          }
        }

        if (!workflowSuccess) {
          // Lire le message d'erreur si disponible
          let errorMessage = `Le workflow Make.com a rencontré une erreur (${webhookRes.status}).`;
          try {
            if (webhookResponse?.error || webhookResponse?.message) {
              errorMessage = webhookResponse.error || webhookResponse.message;
            }
          } catch (e) {
            // Ignorer les erreurs de parsing
          }

          throw new Error(errorMessage);
        }

        console.log('✅ Workflow Make.com terminé avec succès !');
        console.log('Réponse webhook:', webhookResponse);
        setProgress(50);
        setStatusMessage("Workflow terminé, vérification du devis...");

      } catch (fetchError: any) {
        // Gestion des erreurs du webhook
        console.error('❌ Erreur lors de l\'appel au workflow Make.com:', fetchError);
        
        setIsGenerating(false);
        setProgress(0);
        setStatusMessage("");

        // Ne PAS créer le devis si le workflow a échoué
        if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
          throw new Error("Le workflow Make.com a pris trop de temps (timeout après 60 secondes). Le workflow n'a pas pu se terminer. Le devis n'a pas été créé. Veuillez réessayer.");
        } else {
          throw new Error(`Le workflow Make.com a échoué : ${fetchError.message || fetchError}. Le devis n'a pas été créé.`);
        }
      }

      // ÉTAPE 2 : Le workflow Make.com a créé/mis à jour le devis dans Supabase
      // On vérifie que le devis existe maintenant dans Supabase
      if (!workflowSuccess) {
        throw new Error("Le workflow Make.com n'a pas réussi. Le devis n'a pas été créé.");
      }

      setProgress(60);
      setStatusMessage("Vérification du devis créé...");

      // Attendre un peu que Make.com ait terminé l'upsert dans Supabase
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
      // Vérifier que le devis existe dans Supabase (créé par Make.com)
      let devisCreated = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!devisCreated && attempts < maxAttempts) {
        attempts++;
        setProgress(60 + Math.floor((attempts / maxAttempts) * 25));
        setStatusMessage(`Vérification du devis... (${attempts}/${maxAttempts})`);

        const { data: existingDevis, error: checkError } = await supabase
                    .from('devis')
          .select('id, statut, pdf_url')
          .eq('id', devisId)
                    .single();

        if (!checkError && existingDevis) {
          devisCreated = true;
          console.log('✅ Devis trouvé dans Supabase:', existingDevis);
          
          // Vérifier le statut du devis
          if (existingDevis.statut === 'généré' || existingDevis.pdf_url) {
            console.log('✅ Devis généré avec PDF disponible');
          }
          } else {
          // Attendre un peu avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (!devisCreated) {
        // Le devis n'a pas été trouvé après plusieurs tentatives
        // Cela peut arriver si Make.com n'a pas encore terminé, mais on considère quand même que c'est un succès
        // car le workflow Make.com a répondu avec succès
        console.warn('⚠️ Le devis n\'a pas encore été trouvé dans Supabase, mais le workflow a réussi.');
        console.warn('Le devis sera probablement visible après un rafraîchissement.');
      }

      setProgress(90);
      setStatusMessage("Finalisation...");

      // Recharger les devis pour afficher le nouveau devis
      const devisWithLignes = await loadDevisFromSupabase(
        viewMode === "liste" ? (currentPage - 1) * itemsPerPage : undefined,
        viewMode === "liste" ? itemsPerPage : undefined
      );
      setDevis(devisWithLignes);

      setProgress(100);
      setStatusMessage("Devis généré avec succès ✅");

      // Attendre un peu pour que l'utilisateur voie le message de succès
      await new Promise(resolve => setTimeout(resolve, 1000));

        setIsGenerating(false);
        setProgress(0);
        setStatusMessage("");
        setIsCreateSheetOpen(false);
        setFormClientId("");
        setFormVehiculeId("");
        setFormLignes([]);
        setFormRemise(0);
        setFormRemiseType("pourcent");
        setFormCommentaires("");
        setFormStatut("brouillon");

      // Message de succès adapté
      if (devisCreated) {
        toast.success("Devis généré avec succès", {
          description: "Le devis a été créé et généré avec succès par le workflow Make.com.",
          duration: 5000,
        });
      } else {
        toast.success("Workflow terminé", {
          description: "Le workflow Make.com s'est terminé avec succès. Le devis devrait apparaître dans quelques instants.",
          duration: 5000,
        });
      }

    } catch (error: any) {
      setIsGenerating(false);
      setProgress(0);
      setStatusMessage("");
      toast.error("Erreur", {
        description: error.message || "Une erreur est survenue lors de la création du devis.",
      });
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "brouillon":
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Brouillon</Badge>;
      case "généré":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Généré</Badge>;
      case "envoyé":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Envoyé</Badge>;
      case "accepté":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Accepté</Badge>;
      case "refusé":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Refusé</Badge>;
      case "à relancer":
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">À relancer</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                GESTION DES DEVIS
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Liste des{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Devis
                </span>
              </h1>
              <p className="text-sm text-gray-600">Création, gestion et suivi des devis</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-blue-200/50 rounded-lg p-1">
                <Button
                  variant={viewMode === "liste" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("liste")}
                  className={viewMode === "liste" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-blue-50"}
                >
                  <List className="mr-2 h-4 w-4" />
                  Liste
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className={viewMode === "kanban" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-blue-50"}
                >
                  <Grid3x3 className="mr-2 h-4 w-4" />
                  Kanban
                </Button>
              </div>
              <Button
                onClick={handleNouveauDevis}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Filtres */}
        <BlurFade inView delay={0.05}>
          <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher (n° devis, client, véhicule)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-blue-300/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="généré">Généré</SelectItem>
                    <SelectItem value="envoyé">Envoyé</SelectItem>
                    <SelectItem value="accepté">Accepté</SelectItem>
                    <SelectItem value="refusé">Refusé</SelectItem>
                    <SelectItem value="à relancer">À relancer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white border-blue-300/50 text-gray-900">
                    <SelectValue placeholder="Tous les clients" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Vue Liste */}
        {viewMode === "liste" && (
          <BlurFade inView delay={0.1}>
            <Card className="card-3d border border-blue-200/50 bg-white text-gray-900 backdrop-blur-xl group shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-200/50 bg-blue-50/50">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Devis</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Client</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Véhicule</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Montant TTC</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Statut</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Devis généré</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 w-40">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDevis.map((devis) => (
                        <tr
                          key={devis.id}
                          className="border-b border-blue-100/50 hover:bg-blue-50/50 transition-colors"
                          onMouseEnter={() => setHoveredDevisId(devis.id)}
                          onMouseLeave={() => setHoveredDevisId(null)}
                        >
                          <td className="py-5 px-6">
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="space-y-2">
                                <p className="font-semibold text-base text-gray-900">{devis.numero}</p>
                                <p className="text-sm text-gray-600">{devis.clientNom}</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {devis.montantTTC.toLocaleString()} € TTC
                                </p>
                                <div className="mt-2">{getStatutBadge(devis.statut)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-gray-700">
                            <span className="text-sm">
                              {format(new Date(devis.date), "d MMM yyyy", { locale: fr })}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-gray-700">
                            <span className="text-sm">{devis.clientNom}</span>
                          </td>
                          <td className="py-5 px-6 text-gray-700">
                            <span className="text-sm">{devis.vehiculeImmat}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-sm font-medium text-gray-900">
                              {devis.montantTTC.toLocaleString()} €
                            </span>
                          </td>
                          <td className="py-5 px-6">{getStatutBadge(devis.statut)}</td>
                          <td className="py-5 px-6">
                            {devis.pdf_url ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(devis.pdf_url, '_blank')}
                                className="text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50"
                                title="Voir le devis généré"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Voir PDF
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">Non généré</span>
                            )}
                          </td>
                          <td className="py-5 px-6">
                            <div
                              className={`flex items-center gap-3 transition-opacity ${
                                hoveredDevisId === devis.id ? "opacity-100" : "opacity-0"
                              }`}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditDevis(devis)}
                                className="h-9 w-9 p-0 hover:bg-blue-50"
                                title="Voir"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDupliquerDevis(devis)}
                                className="h-9 w-9 p-0 hover:bg-blue-50"
                                title="Dupliquer"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              {devis.pdf_url && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEmailDialog(devis.id)}
                                  className="h-9 w-9 p-0 hover:bg-blue-50"
                                  title="Envoyer par email"
                                >
                                  <Send className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              {devis.statut === "accepté" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleTransformerEnFacture(devis.id)}
                                  className="h-9 w-9 p-0 hover:bg-green-50"
                                  title="Transformer en facture"
                                >
                                  <Receipt className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDevis(devis.id, devis.numero);
                                }}
                                className="h-9 w-9 p-0 hover:bg-red-50"
                                title="Supprimer le devis"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredDevis.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-700/60">Aucun devis trouvé</p>
                  </div>
                )}
                
                {/* Pagination - Afficher seulement s'il y a plus d'une page ou si totalDevis est défini */}
                {totalDevis > 0 && Math.ceil(totalDevis / itemsPerPage) > 1 && (
                  <div className="p-4 border-t border-blue-200/50">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) {
                                setCurrentPage(currentPage - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.max(1, Math.ceil(totalDevis / itemsPerPage)) }, (_, i) => i + 1).map((page) => {
                          // Afficher la première page, la dernière page, la page actuelle, et les pages adjacentes
                          const totalPages = Math.ceil(totalDevis / itemsPerPage);
                          const showPage = 
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);
                          
                          if (!showPage) {
                            // Afficher des ellipses
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          }
                          
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={(e) => {
                              e.preventDefault();
                              const totalPages = Math.ceil(totalDevis / itemsPerPage);
                              if (currentPage < totalPages) {
                                setCurrentPage(currentPage + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className={currentPage >= Math.ceil(totalDevis / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                    
                    <div className="text-center mt-2 text-sm text-gray-600">
                      Page {currentPage} sur {Math.ceil(totalDevis / itemsPerPage)} ({totalDevis} devis au total{searchQuery && ` • ${filteredDevis.length} résultat(s) de recherche`})
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </BlurFade>
        )}

        {/* Vue Kanban avec Drag & Drop */}
        {viewMode === "kanban" && (
          <BlurFade inView delay={0.1}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <p className="text-sm text-gray-600">Chargement des devis...</p>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-6 gap-4">
                  {/* Colonne Brouillons */}
                  <KanbanColumn
                    id="brouillon"
                    title="Brouillons"
                    count={devisByStatut.brouillon.length}
                    total={totauxKanban.brouillon}
                    headerClassName="bg-gray-100"
                    contentClassName="bg-gray-50/50"
                    borderColor="border-gray-200"
                  >
                    <SortableContext
                      id="brouillon"
                      items={devisByStatut.brouillon.map(d => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {devisByStatut.brouillon.map((devis) => (
                        <SortableDevisCard
                          key={devis.id}
                          devis={devis}
                          onEdit={handleEditDevis}
                          onSend={sendDevisByEmail}
                          onDelete={handleDeleteDevis}
                        />
                      ))}
                      {devisByStatut.brouillon.length === 0 && (
                        <div className="text-center py-8 text-xs text-gray-500">Aucun brouillon</div>
                      )}
                    </SortableContext>
                  </KanbanColumn>

                  {/* Colonne Généré */}
                  <KanbanColumn
                    id="généré"
                    title="Généré"
                    count={devisByStatut.généré.length}
                    total={totauxKanban.généré}
                    headerClassName="bg-blue-100"
                    contentClassName="bg-blue-50/50"
                    borderColor="border-blue-200"
                  >
                    <SortableContext
                      id="généré"
                      items={devisByStatut.généré.map(d => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {devisByStatut.généré.map((devis) => (
                        <SortableDevisCard
                          key={devis.id}
                          devis={devis}
                          onEdit={handleEditDevis}
                          onSend={sendDevisByEmail}
                          onDelete={handleDeleteDevis}
                        />
                      ))}
                      {devisByStatut.généré.length === 0 && (
                        <div className="text-center py-8 text-xs text-gray-500">Aucun généré</div>
                      )}
                    </SortableContext>
                  </KanbanColumn>

                  {/* Colonne Envoyés */}
                  <KanbanColumn
                    id="envoyé"
                    title="Envoyés"
                    count={devisByStatut.envoyé.length}
                    total={totauxKanban.envoyé}
                    headerClassName="bg-blue-100"
                    contentClassName="bg-blue-50/50"
                    borderColor="border-blue-200"
                  >
                    <SortableContext
                      id="envoyé"
                      items={devisByStatut.envoyé.map(d => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {devisByStatut.envoyé.map((devis) => (
                        <SortableDevisCard
                          key={devis.id}
                          devis={devis}
                          onEdit={handleEditDevis}
                          onSend={sendDevisByEmail}
                          onDelete={handleDeleteDevis}
                        />
                      ))}
                      {devisByStatut.envoyé.length === 0 && (
                        <div className="text-center py-8 text-xs text-gray-500">Aucun envoyé</div>
                      )}
                    </SortableContext>
                  </KanbanColumn>

                  {/* Colonne Acceptés */}
                  <KanbanColumn
                    id="accepté"
                    title="Acceptés"
                    count={devisByStatut.accepté.length}
                    total={totauxKanban.accepté}
                    headerClassName="bg-green-100"
                    contentClassName="bg-green-50/50"
                    borderColor="border-green-200"
                  >
                    <SortableContext
                      id="accepté"
                      items={devisByStatut.accepté.map(d => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {devisByStatut.accepté.map((devis) => (
                        <SortableDevisCard
                          key={devis.id}
                          devis={devis}
                          onEdit={handleEditDevis}
                          onSend={sendDevisByEmail}
                          onDelete={handleDeleteDevis}
                        />
                      ))}
                      {devisByStatut.accepté.length === 0 && (
                        <div className="text-center py-8 text-xs text-gray-500">Aucun accepté</div>
                      )}
                    </SortableContext>
                  </KanbanColumn>

                  {/* Colonne Refusés */}
                  <KanbanColumn
                    id="refusé"
                    title="Refusés"
                    count={devisByStatut.refusé.length}
                    total={totauxKanban.refusé}
                    headerClassName="bg-red-100"
                    contentClassName="bg-red-50/50"
                    borderColor="border-red-200"
                  >
                    <SortableContext
                      id="refusé"
                      items={devisByStatut.refusé.map(d => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {devisByStatut.refusé.map((devis) => (
                        <SortableDevisCard
                          key={devis.id}
                          devis={devis}
                          onEdit={handleEditDevis}
                          onSend={sendDevisByEmail}
                          onDelete={handleDeleteDevis}
                        />
                      ))}
                      {devisByStatut.refusé.length === 0 && (
                        <div className="text-center py-8 text-xs text-gray-500">Aucun refusé</div>
                      )}
                    </SortableContext>
                  </KanbanColumn>

                  {/* Colonne À relancer */}
                  <KanbanColumn
                    id="à relancer"
                    title="À relancer"
                    count={devisByStatut["à relancer"].length}
                    total={totauxKanban["à relancer"]}
                    headerClassName="bg-orange-100"
                    contentClassName="bg-orange-50/50"
                    borderColor="border-orange-200"
                  >
                    <SortableContext
                      id="à relancer"
                      items={devisByStatut["à relancer"].map(d => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {devisByStatut["à relancer"].map((devis) => (
                        <SortableDevisCard
                          key={devis.id}
                          devis={devis}
                          onEdit={handleEditDevis}
                          onSend={sendDevisByEmail}
                          onDelete={handleDeleteDevis}
                        />
                      ))}
                      {devisByStatut["à relancer"].length === 0 && (
                        <div className="text-center py-8 text-xs text-gray-500">Aucun à relancer</div>
                      )}
                    </SortableContext>
                  </KanbanColumn>
                </div>
                <DragOverlay
                  adjustScale={false}
                  dropAnimation={null}
                  style={{ cursor: 'grabbing' }}
                >
                  {activeId ? (() => {
                    const activeDevis = devis.find(d => d.id === activeId);
                    if (!activeDevis) return null;
                    
                    return (
                      <Card className="border-2 border-blue-400 bg-white shadow-xl w-64 opacity-95">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <p className="font-semibold text-sm text-gray-900">{activeDevis.numero}</p>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="truncate">{activeDevis.clientNom}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Car className="h-3 w-3" />
                                <span>{activeDevis.vehiculeImmat}</span>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-sm font-bold text-gray-900">
                                {activeDevis.montantTTC.toLocaleString()} € TTC
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })() : null}
                </DragOverlay>
              </DndContext>
            )}
          </BlurFade>
        )}

        {/* Drawer Création/Édition */}
        <Sheet open={isCreateSheetOpen || isEditSheetOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateSheetOpen(false);
            setIsEditSheetOpen(false);
          }
        }}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-white border-blue-200/50 text-gray-900">
            <SheetHeader>
              <SheetTitle className="text-gray-900">
                {isCreateSheetOpen ? "Créer un devis" : "Modifier le devis"}
              </SheetTitle>
              <SheetDescription className="text-gray-700/70">
                {isCreateSheetOpen
                  ? "Créez un nouveau devis pour un client"
                  : "Modifiez les informations du devis"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Bloc Client & Véhicule */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900">Client & Véhicule</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Client</label>
                    <Select value={formClientId} onValueChange={setFormClientId}>
                      <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Véhicule</label>
                    <Select value={formVehiculeId} onValueChange={setFormVehiculeId} disabled={!formClientId}>
                      <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                        <SelectValue placeholder="Sélectionner un véhicule" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        {vehiculesFiltres.map((vehicule) => (
                          <SelectItem key={vehicule.id} value={vehicule.id}>
                            {vehicule.immatriculation} - {vehicule.marque} {vehicule.modele}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Bloc Lignes du devis */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Lignes du devis</h3>
                  <Tabs value={activeLigneTab} onValueChange={(v) => setActiveLigneTab(v as typeof activeLigneTab)}>
                    <TabsList className="bg-white border-blue-300/50">
                      <TabsTrigger value="prestations" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                        <Wrench className="mr-2 h-4 w-4" />
                        Prestations
                      </TabsTrigger>
                      <TabsTrigger value="pieces" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                        <Package className="mr-2 h-4 w-4" />
                        Pièces
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Tabs value={activeLigneTab} onValueChange={(v) => setActiveLigneTab(v as typeof activeLigneTab)}>
                  <TabsContent value="prestations">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {prestations.map((prestation) => (
                        <div
                          key={prestation.id}
                          className="flex items-center justify-between p-2 border border-blue-200/50 rounded hover:bg-blue-50/50 cursor-pointer"
                          onClick={() => handleAjouterPrestation(prestation)}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{prestation.designation}</p>
                            <p className="text-xs text-gray-600">{prestation.prixHT}€ HT • {prestation.temps}h</p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="pieces">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {pieces.map((piece) => (
                        <div
                          key={piece.id}
                          className="flex items-center justify-between p-2 border border-blue-200/50 rounded hover:bg-blue-50/50 cursor-pointer"
                          onClick={() => handleAjouterPiece(piece)}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{piece.designation}</p>
                            <p className="text-xs text-gray-600">{piece.reference} • {piece.prixVente}€ HT</p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Lignes ajoutées */}
                <div className="space-y-2 mt-4">
                  {formLignes.map((ligne) => (
                    <div key={ligne.id} className="flex items-center gap-2 p-2 bg-white border border-blue-200/50 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{ligne.designation}</p>
                        <p className="text-xs text-gray-600">
                          Qté: {ligne.quantite} × {ligne.prixUnitaireHT}€ = {ligne.totalHT}€ HT
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSupprimerLigne(ligne.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleAjouterLigneLibre}
                    className="w-full border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une ligne libre
                  </Button>
                </div>
              </div>

              {/* Bloc Totaux */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900">Récap & Totaux</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Sous-total prestations</span>
                    <span className="font-semibold text-gray-900">{totaux.sousTotalPrestations.toLocaleString()} € HT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Sous-total pièces</span>
                    <span className="font-semibold text-gray-900">{totaux.sousTotalPieces.toLocaleString()} € HT</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-blue-200/50 pt-2">
                    <span className="text-gray-700">Total HT</span>
                    <span className="font-semibold text-gray-900">{totaux.totalHT.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">TVA (20%)</span>
                    <span className="font-semibold text-gray-900">{totaux.tva.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-blue-200/50 pt-2">
                    <span className="text-gray-900">Total TTC</span>
                    <span className="text-gray-900">{totaux.totalTTC.toLocaleString()} €</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Remise</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formRemise}
                      onChange={(e) => setFormRemise(Number(e.target.value))}
                      className="bg-white border-blue-300/50 text-gray-900"
                      placeholder="0"
                    />
                    <Select value={formRemiseType} onValueChange={(v) => setFormRemiseType(v as typeof formRemiseType)}>
                      <SelectTrigger className="w-[120px] bg-white border-blue-300/50 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                        <SelectItem value="pourcent">%</SelectItem>
                        <SelectItem value="montant">€</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Bloc Statut */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="font-semibold text-gray-900">Statut & Envoi</h3>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                  <Select value={formStatut} onValueChange={(v) => setFormStatut(v as Devis["statut"])}>
                    <SelectTrigger className="bg-white border-blue-300/50 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value="généré">Généré</SelectItem>
                      <SelectItem value="envoyé">Envoyé</SelectItem>
                      <SelectItem value="accepté">Accepté</SelectItem>
                      <SelectItem value="refusé">Refusé</SelectItem>
                      <SelectItem value="à relancer">À relancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Commentaires</label>
                  <Textarea
                    value={formCommentaires}
                    onChange={(e) => setFormCommentaires(e.target.value)}
                    rows={3}
                    className="bg-white border-blue-300/50 text-gray-900"
                    placeholder="Commentaires ou conditions particulières..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4 border-t border-blue-200/50">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateSheetOpen(false);
                      setIsEditSheetOpen(false);
                      setIsGenerating(false);
                      setProgress(0);
                      setStatusMessage("");
                    }}
                    className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                    disabled={isGenerating}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSauvegarder}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isGenerating}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isCreateSheetOpen ? "Créer" : "Enregistrer"}
                  </Button>
                </div>

                {/* Barre de progression améliorée */}
                {isGenerating && (
                  <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500 ease-out rounded-full relative"
                        style={{ width: `${progress}%` }}
                      >
                        {/* Effet de brillance animé */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-slide" />
                      </div>
                      {/* Indicateur de pourcentage */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-gray-700 animate-pulse">{statusMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialog PDF Preview */}
        <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
          <DialogContent className="bg-white border-blue-200/50 text-gray-900 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Prévisualisation PDF</DialogTitle>
              <DialogDescription className="text-gray-700/70">Aperçu du devis au format PDF</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-gray-100 rounded-lg min-h-[400px] flex items-center justify-center">
              <p className="text-gray-600">Aperçu PDF du devis</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de prévisualisation et envoi d'email */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Envoyer le devis par email
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Vérifiez et modifiez le contenu de l'email avant l'envoi
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Informations du devis */}
              {emailDevis && (
                <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Informations du devis</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Numéro :</span> {emailDevis.numero}
                    </div>
                    <div>
                      <span className="font-medium">Date :</span> {new Date(emailDevis.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div>
                      <span className="font-medium">Client :</span> {emailClient?.nom}
                    </div>
                    <div>
                      <span className="font-medium">Véhicule :</span> {emailDevis.vehiculeImmat}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Montant TTC :</span> {emailDevis.montantTTC.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                </div>
              )}

              {/* Destinataire */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Destinataire
                </label>
                <Input
                  value={emailClient?.email || ""}
                  disabled
                  className="bg-gray-50 border-blue-300/50 text-gray-700"
                />
              </div>

              {/* Sujet */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sujet
                </label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="bg-white border-blue-300/50 text-gray-900"
                  placeholder="Sujet de l'email"
                />
              </div>

              {/* Corps de l'email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Message
                </label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={12}
                  className="bg-white border-blue-300/50 text-gray-900 font-mono text-sm"
                  placeholder="Corps de l'email"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-blue-200/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEmailDialogOpen(false);
                    setEmailDevis(null);
                    setEmailClient(null);
                    setEmailSubject("");
                    setEmailBody("");
                  }}
                  className="border-blue-500/30 bg-white text-gray-700 hover:bg-blue-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSendEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!emailSubject.trim() || !emailBody.trim() || !emailClient?.email}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer l'email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Devis;
