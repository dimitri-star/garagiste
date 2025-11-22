import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Clock,
  AlertCircle,
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpDown,
  Plus,
  Search,
  Euro,
  Filter,
  XCircle,
  CheckCircle2,
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
import { format, parseISO, startOfMonth, endOfMonth, subMonths, addDays, isBefore, isAfter } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface Facture {
  id: string;
  numero: string;
  date: string;
  clientId: string;
  clientNom: string;
  clientType: "particulier" | "pro";
  vehiculeImmat?: string;
  vehiculeMarque?: string;
  montantTTC: number;
  statutPaiement: "payée" | "en_attente" | "partielle";
  dateEcheance?: string;
  lignes: {
    type: "prestation" | "piece" | "libre";
    designation: string;
  }[];
}

interface Devis {
  id: string;
  numero: string;
  date: string;
  clientId: string;
  clientNom: string;
  clientType: "particulier" | "pro";
  vehiculeImmat: string;
  vehiculeMarque?: string;
  montantTTC: number;
  statut: "accepté";
}

const RapportFinancier = () => {
  const navigate = useNavigate();
  const [periodeFilter, setPeriodeFilter] = useState<string>("ce_mois");
  const [dateDebut, setDateDebut] = useState<string>(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [dateFin, setDateFin] = useState<string>(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [typeClientFilter, setTypeClientFilter] = useState<string>("all");
  const [vehiculeFilter, setVehiculeFilter] = useState<string>("");
  const [sortFacturesBy, setSortFacturesBy] = useState<"date" | "montant" | "statut">("date");
  const [sortFacturesOrder, setSortFacturesOrder] = useState<"asc" | "desc">("desc");
  const [showFacturesEnRetard, setShowFacturesEnRetard] = useState(false);
  const [selectedPrestationType, setSelectedPrestationType] = useState<string | null>(null);

  // Génération de dates basées sur la date actuelle
  const aujourdhui = new Date();
  const ceMois = format(aujourdhui, "yyyy-MM");
  const moisPrecedent = format(subMonths(aujourdhui, 1), "yyyy-MM");
  const moisPrecedent2 = format(subMonths(aujourdhui, 2), "yyyy-MM");
  const moisPrecedent3 = format(subMonths(aujourdhui, 3), "yyyy-MM");

  // Données de test - Factures réparties sur 12 mois
  const [factures] = useState<Facture[]>([
    // Ce mois
    {
      id: "1",
      numero: "FAC-2024-145",
      date: `${ceMois}-25`,
      clientId: "1",
      clientNom: "Martin Dupont",
      clientType: "particulier",
      vehiculeImmat: "AB-123-CD",
      vehiculeMarque: "Peugeot",
      montantTTC: 850,
      statutPaiement: "payée",
      lignes: [
        { type: "prestation", designation: "Vidange moteur" },
        { type: "piece", designation: "Filtre à huile" },
      ],
    },
    {
      id: "2",
      numero: "FAC-2024-146",
      date: `${ceMois}-22`,
      clientId: "2",
      clientNom: "Garage Auto Pro",
      clientType: "pro",
      vehiculeImmat: "EF-456-GH",
      vehiculeMarque: "Renault",
      montantTTC: 1200,
      statutPaiement: "en_attente",
      dateEcheance: format(addDays(new Date(), 10), "yyyy-MM-dd"),
      lignes: [{ type: "prestation", designation: "Révision complète" }],
    },
    {
      id: "3",
      numero: "FAC-2024-147",
      date: `${ceMois}-20`,
      clientId: "3",
      clientNom: "Sophie Bernard",
      clientType: "particulier",
      vehiculeImmat: "IJ-789-KL",
      vehiculeMarque: "Citroën",
      montantTTC: 650,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Remplacement plaquettes de frein avant" }],
    },
    {
      id: "4",
      numero: "FAC-2024-148",
      date: `${ceMois}-18`,
      clientId: "4",
      clientNom: "Pierre Martin",
      clientType: "particulier",
      vehiculeImmat: "MN-012-OP",
      vehiculeMarque: "Volkswagen",
      montantTTC: 450,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Contrôle technique" }],
    },
    {
      id: "5",
      numero: "FAC-2024-149",
      date: `${ceMois}-15`,
      clientId: "5",
      clientNom: "Jean Dubois",
      clientType: "pro",
      vehiculeImmat: "QR-345-ST",
      vehiculeMarque: "Ford",
      montantTTC: 980,
      statutPaiement: "en_attente",
      dateEcheance: format(endOfMonth(aujourdhui), "yyyy-MM-dd"),
      lignes: [{ type: "prestation", designation: "Remplacement courroie de distribution" }],
    },
    {
      id: "6",
      numero: "FAC-2024-150",
      date: `${ceMois}-12`,
      clientId: "6",
      clientNom: "Claire Moreau",
      clientType: "particulier",
      vehiculeImmat: "UV-678-WX",
      vehiculeMarque: "BMW",
      montantTTC: 720,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
    {
      id: "7",
      numero: "FAC-2024-151",
      date: `${ceMois}-10`,
      clientId: "7",
      clientNom: "Thomas Leroy",
      clientType: "particulier",
      vehiculeImmat: "XY-123-ZA",
      vehiculeMarque: "Mercedes",
      montantTTC: 1850,
      statutPaiement: "payée",
      lignes: [
        { type: "prestation", designation: "Révision complète" },
        { type: "prestation", designation: "Remplacement pneus" },
      ],
    },
    {
      id: "8",
      numero: "FAC-2024-152",
      date: `${ceMois}-08`,
      clientId: "8",
      clientNom: "Auto Service 34",
      clientType: "pro",
      vehiculeImmat: "BC-456-DE",
      vehiculeMarque: "Opel",
      montantTTC: 650,
      statutPaiement: "en_attente",
      dateEcheance: format(addDays(new Date(), 5), "yyyy-MM-dd"),
      lignes: [{ type: "prestation", designation: "Contrôle technique" }],
    },
    {
      id: "9",
      numero: "FAC-2024-153",
      date: `${ceMois}-05`,
      clientId: "9",
      clientNom: "Marie Petit",
      clientType: "particulier",
      vehiculeImmat: "FG-789-HI",
      vehiculeMarque: "Toyota",
      montantTTC: 420,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
    {
      id: "10",
      numero: "FAC-2024-154",
      date: `${ceMois}-02`,
      clientId: "10",
      clientNom: "François Moreau",
      clientType: "particulier",
      vehiculeImmat: "JK-012-LM",
      vehiculeMarque: "Hyundai",
      montantTTC: 1150,
      statutPaiement: "en_attente",
      dateEcheance: format(addDays(new Date(), -5), "yyyy-MM-dd"),
      lignes: [{ type: "prestation", designation: "Remplacement embrayage" }],
    },
    // Mois précédent
    {
      id: "11",
      numero: "FAC-2024-135",
      date: `${moisPrecedent}-28`,
      clientId: "11",
      clientNom: "Lucas Durand",
      clientType: "particulier",
      vehiculeImmat: "NO-345-PQ",
      vehiculeMarque: "Audi",
      montantTTC: 2300,
      statutPaiement: "payée",
      lignes: [
        { type: "prestation", designation: "Révision complète" },
        { type: "prestation", designation: "Remplacement courroie de distribution" },
      ],
    },
    {
      id: "12",
      numero: "FAC-2024-136",
      date: `${moisPrecedent}-25`,
      clientId: "12",
      clientNom: "Garage Mécanique Pro",
      clientType: "pro",
      vehiculeImmat: "RS-678-TU",
      vehiculeMarque: "Nissan",
      montantTTC: 750,
      statutPaiement: "en_attente",
      dateEcheance: format(endOfMonth(subMonths(aujourdhui, 1)), "yyyy-MM-dd"),
      lignes: [{ type: "prestation", designation: "Remplacement plaquettes de frein" }],
    },
    {
      id: "13",
      numero: "FAC-2024-137",
      date: `${moisPrecedent}-22`,
      clientId: "13",
      clientNom: "Julie Martin",
      clientType: "particulier",
      vehiculeImmat: "VW-901-YZ",
      vehiculeMarque: "Peugeot",
      montantTTC: 550,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
    {
      id: "14",
      numero: "FAC-2024-138",
      date: `${moisPrecedent}-20`,
      clientId: "14",
      clientNom: "Marc Simon",
      clientType: "particulier",
      vehiculeImmat: "AA-234-BB",
      vehiculeMarque: "Renault",
      montantTTC: 890,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Contrôle technique" }],
    },
    {
      id: "15",
      numero: "FAC-2024-139",
      date: `${moisPrecedent}-18`,
      clientId: "15",
      clientNom: "Sarah Dubois",
      clientType: "particulier",
      vehiculeImmat: "CC-567-DD",
      vehiculeMarque: "Citroën",
      montantTTC: 620,
      statutPaiement: "en_attente",
      dateEcheance: format(endOfMonth(subMonths(aujourdhui, 1)), "yyyy-MM-dd"),
      lignes: [{ type: "prestation", designation: "Remplacement pneus avant" }],
    },
    {
      id: "16",
      numero: "FAC-2024-140",
      date: `${moisPrecedent}-15`,
      clientId: "16",
      clientNom: "Pierre Bernard",
      clientType: "particulier",
      vehiculeImmat: "EE-890-FF",
      vehiculeMarque: "Volkswagen",
      montantTTC: 1100,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Révision complète" }],
    },
    {
      id: "17",
      numero: "FAC-2024-141",
      date: `${moisPrecedent}-12`,
      clientId: "17",
      clientNom: "Auto Centre Béziers",
      clientType: "pro",
      vehiculeImmat: "GG-123-HH",
      vehiculeMarque: "Ford",
      montantTTC: 1450,
      statutPaiement: "payée",
      lignes: [
        { type: "prestation", designation: "Remplacement courroie" },
        { type: "prestation", designation: "Vidange moteur" },
      ],
    },
    {
      id: "18",
      numero: "FAC-2024-142",
      date: `${moisPrecedent}-10`,
      clientId: "18",
      clientNom: "Caroline Moreau",
      clientType: "particulier",
      vehiculeImmat: "II-456-JJ",
      vehiculeMarque: "BMW",
      montantTTC: 1750,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Remplacement embrayage" }],
    },
    {
      id: "19",
      numero: "FAC-2024-143",
      date: `${moisPrecedent}-08`,
      clientId: "19",
      clientNom: "Nicolas Petit",
      clientType: "particulier",
      vehiculeImmat: "KK-789-LL",
      vehiculeMarque: "Mercedes",
      montantTTC: 480,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Contrôle technique" }],
    },
    {
      id: "20",
      numero: "FAC-2024-144",
      date: `${moisPrecedent}-05`,
      clientId: "20",
      clientNom: "Stéphanie Leroy",
      clientType: "particulier",
      vehiculeImmat: "MM-012-NN",
      vehiculeMarque: "Opel",
      montantTTC: 720,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
    // Mois précédent - 2
    {
      id: "21",
      numero: "FAC-2024-125",
      date: `${moisPrecedent2}-28`,
      clientId: "21",
      clientNom: "David Durand",
      clientType: "particulier",
      vehiculeImmat: "OO-345-PP",
      vehiculeMarque: "Toyota",
      montantTTC: 950,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Révision complète" }],
    },
    {
      id: "22",
      numero: "FAC-2024-126",
      date: `${moisPrecedent2}-25`,
      clientId: "22",
      clientNom: "Mécanique Express",
      clientType: "pro",
      vehiculeImmat: "QQ-678-RR",
      vehiculeMarque: "Hyundai",
      montantTTC: 680,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Remplacement plaquettes" }],
    },
    {
      id: "23",
      numero: "FAC-2024-127",
      date: `${moisPrecedent2}-22`,
      clientId: "23",
      clientNom: "Amélie Martin",
      clientType: "particulier",
      vehiculeImmat: "SS-901-TT",
      vehiculeMarque: "Audi",
      montantTTC: 2100,
      statutPaiement: "payée",
      lignes: [
        { type: "prestation", designation: "Révision complète" },
        { type: "prestation", designation: "Remplacement pneus" },
      ],
    },
    {
      id: "24",
      numero: "FAC-2024-128",
      date: `${moisPrecedent2}-20`,
      clientId: "24",
      clientNom: "Laurent Simon",
      clientType: "particulier",
      vehiculeImmat: "UU-234-VV",
      vehiculeMarque: "Nissan",
      montantTTC: 520,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
    {
      id: "25",
      numero: "FAC-2024-129",
      date: `${moisPrecedent2}-18`,
      clientId: "25",
      clientNom: "Émilie Dubois",
      clientType: "particulier",
      vehiculeImmat: "WW-567-XX",
      vehiculeMarque: "Peugeot",
      montantTTC: 830,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Contrôle technique" }],
    },
    {
      id: "26",
      numero: "FAC-2024-130",
      date: `${moisPrecedent2}-15`,
      clientId: "26",
      clientNom: "Fabien Bernard",
      clientType: "particulier",
      vehiculeImmat: "YY-890-ZZ",
      vehiculeMarque: "Renault",
      montantTTC: 1020,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Remplacement courroie" }],
    },
    {
      id: "27",
      numero: "FAC-2024-131",
      date: `${moisPrecedent2}-12`,
      clientId: "27",
      clientNom: "Garage Moderne",
      clientType: "pro",
      vehiculeImmat: "AB-123-CC",
      vehiculeMarque: "Citroën",
      montantTTC: 760,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Révision complète" }],
    },
    {
      id: "28",
      numero: "FAC-2024-132",
      date: `${moisPrecedent2}-10`,
      clientId: "28",
      clientNom: "Isabelle Moreau",
      clientType: "particulier",
      vehiculeImmat: "DD-456-EE",
      vehiculeMarque: "Volkswagen",
      montantTTC: 590,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
    {
      id: "29",
      numero: "FAC-2024-133",
      date: `${moisPrecedent2}-08`,
      clientId: "29",
      clientNom: "Julien Petit",
      clientType: "particulier",
      vehiculeImmat: "FF-789-GG",
      vehiculeMarque: "Ford",
      montantTTC: 1340,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Remplacement embrayage" }],
    },
    {
      id: "30",
      numero: "FAC-2024-134",
      date: `${moisPrecedent2}-05`,
      clientId: "30",
      clientNom: "Céline Leroy",
      clientType: "particulier",
      vehiculeImmat: "HH-012-II",
      vehiculeMarque: "BMW",
      montantTTC: 1680,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Révision complète" }],
    },
    // Mois précédent - 3
    {
      id: "31",
      numero: "FAC-2024-115",
      date: `${moisPrecedent3}-28`,
      clientId: "31",
      clientNom: "Romain Durand",
      clientType: "particulier",
      vehiculeImmat: "JJ-345-KK",
      vehiculeMarque: "Mercedes",
      montantTTC: 920,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Contrôle technique" }],
    },
    {
      id: "32",
      numero: "FAC-2024-116",
      date: `${moisPrecedent3}-25`,
      clientId: "32",
      clientNom: "Auto Service Régional",
      clientType: "pro",
      vehiculeImmat: "LL-678-MM",
      vehiculeMarque: "Opel",
      montantTTC: 640,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
    {
      id: "33",
      numero: "FAC-2024-117",
      date: `${moisPrecedent3}-22`,
      clientId: "33",
      clientNom: "Manon Martin",
      clientType: "particulier",
      vehiculeImmat: "NN-901-OO",
      vehiculeMarque: "Toyota",
      montantTTC: 470,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
    {
      id: "34",
      numero: "FAC-2024-118",
      date: `${moisPrecedent3}-20`,
      clientId: "34",
      clientNom: "Antoine Simon",
      clientType: "particulier",
      vehiculeImmat: "PP-234-QQ",
      vehiculeMarque: "Hyundai",
      montantTTC: 1080,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Révision complète" }],
    },
    {
      id: "35",
      numero: "FAC-2024-119",
      date: `${moisPrecedent3}-18`,
      clientId: "35",
      clientNom: "Camille Dubois",
      clientType: "particulier",
      vehiculeImmat: "RR-567-SS",
      vehiculeMarque: "Audi",
      montantTTC: 1950,
      statutPaiement: "payée",
      lignes: [
        { type: "prestation", designation: "Révision complète" },
        { type: "prestation", designation: "Remplacement plaquettes" },
      ],
    },
    {
      id: "36",
      numero: "FAC-2024-120",
      date: `${moisPrecedent3}-15`,
      clientId: "36",
      clientNom: "Benoît Bernard",
      clientType: "particulier",
      vehiculeImmat: "TT-890-UU",
      vehiculeMarque: "Nissan",
      montantTTC: 710,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Contrôle technique" }],
    },
    {
      id: "37",
      numero: "FAC-2024-121",
      date: `${moisPrecedent3}-12`,
      clientId: "37",
      clientNom: "Garage Pro Auto",
      clientType: "pro",
      vehiculeImmat: "VV-123-WW",
      vehiculeMarque: "Peugeot",
      montantTTC: 820,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Remplacement courroie" }],
    },
    {
      id: "38",
      numero: "FAC-2024-122",
      date: `${moisPrecedent3}-10`,
      clientId: "38",
      clientNom: "Laura Moreau",
      clientType: "particulier",
      vehiculeImmat: "XX-456-YY",
      vehiculeMarque: "Renault",
      montantTTC: 560,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
    {
      id: "39",
      numero: "FAC-2024-123",
      date: `${moisPrecedent3}-08`,
      clientId: "39",
      clientNom: "Sébastien Petit",
      clientType: "particulier",
      vehiculeImmat: "ZZ-789-AA",
      vehiculeMarque: "Citroën",
      montantTTC: 1250,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Remplacement embrayage" }],
    },
    {
      id: "40",
      numero: "FAC-2024-124",
      date: `${moisPrecedent3}-05`,
      clientId: "40",
      clientNom: "Marion Leroy",
      clientType: "particulier",
      vehiculeImmat: "BB-012-CC",
      vehiculeMarque: "Volkswagen",
      montantTTC: 390,
      statutPaiement: "payée",
      lignes: [{ type: "prestation", designation: "Vidange moteur" }],
    },
  ]);

  const [devisAcceptes] = useState<Devis[]>([
    {
      id: "1",
      numero: "DEV-2024-045",
      date: format(addDays(new Date(), -1), "yyyy-MM-dd"),
      clientId: "41",
      clientNom: "Thomas Martin",
      clientType: "particulier",
      vehiculeImmat: "DD-234-EE",
      vehiculeMarque: "Peugeot",
      montantTTC: 680,
      statut: "accepté",
    },
    {
      id: "2",
      numero: "DEV-2024-046",
      date: format(addDays(new Date(), -3), "yyyy-MM-dd"),
      clientId: "42",
      clientNom: "Auto Mécanique Express",
      clientType: "pro",
      vehiculeImmat: "FF-567-GG",
      vehiculeMarque: "Renault",
      montantTTC: 1250,
      statut: "accepté",
    },
    {
      id: "3",
      numero: "DEV-2024-047",
      date: format(addDays(new Date(), -5), "yyyy-MM-dd"),
      clientId: "43",
      clientNom: "Céline Bernard",
      clientType: "particulier",
      vehiculeImmat: "HH-890-II",
      vehiculeMarque: "Citroën",
      montantTTC: 420,
      statut: "accepté",
    },
    {
      id: "4",
      numero: "DEV-2024-048",
      date: format(addDays(new Date(), -7), "yyyy-MM-dd"),
      clientId: "44",
      clientNom: "Julien Dubois",
      clientType: "particulier",
      vehiculeImmat: "JJ-123-KK",
      vehiculeMarque: "Volkswagen",
      montantTTC: 950,
      statut: "accepté",
    },
    {
      id: "5",
      numero: "DEV-2024-049",
      date: format(addDays(new Date(), -9), "yyyy-MM-dd"),
      clientId: "45",
      clientNom: "Garage Moderne Pro",
      clientType: "pro",
      vehiculeImmat: "LL-456-MM",
      vehiculeMarque: "Ford",
      montantTTC: 580,
      statut: "accepté",
    },
    {
      id: "6",
      numero: "DEV-2024-050",
      date: format(addDays(new Date(), -11), "yyyy-MM-dd"),
      clientId: "46",
      clientNom: "Amélie Moreau",
      clientType: "particulier",
      vehiculeImmat: "NN-789-OO",
      vehiculeMarque: "BMW",
      montantTTC: 1450,
      statut: "accepté",
    },
    {
      id: "7",
      numero: "DEV-2024-051",
      date: format(addDays(new Date(), -13), "yyyy-MM-dd"),
      clientId: "47",
      clientNom: "Fabien Petit",
      clientType: "particulier",
      vehiculeImmat: "PP-012-QQ",
      vehiculeMarque: "Mercedes",
      montantTTC: 1120,
      statut: "accepté",
    },
    {
      id: "8",
      numero: "DEV-2024-052",
      date: format(addDays(new Date(), -15), "yyyy-MM-dd"),
      clientId: "48",
      clientNom: "Sarah Leroy",
      clientType: "particulier",
      vehiculeImmat: "RR-345-SS",
      vehiculeMarque: "Opel",
      montantTTC: 360,
      statut: "accepté",
    },
    {
      id: "9",
      numero: "DEV-2024-053",
      date: format(addDays(new Date(), -17), "yyyy-MM-dd"),
      clientId: "49",
      clientNom: "Auto Centre 34",
      clientType: "pro",
      vehiculeImmat: "TT-678-UU",
      vehiculeMarque: "Toyota",
      montantTTC: 780,
      statut: "accepté",
    },
    {
      id: "10",
      numero: "DEV-2024-054",
      date: format(addDays(new Date(), -19), "yyyy-MM-dd"),
      clientId: "50",
      clientNom: "Manon Durand",
      clientType: "particulier",
      vehiculeImmat: "VV-901-WW",
      vehiculeMarque: "Hyundai",
      montantTTC: 520,
      statut: "accepté",
    },
  ]);

  // Calcul des dates selon la période
  const periodeDates = useMemo(() => {
    const aujourdhui = new Date();
    switch (periodeFilter) {
      case "ce_mois":
        return {
          debut: startOfMonth(aujourdhui),
          fin: endOfMonth(aujourdhui),
        };
      case "mois_precedent":
        const moisPrecedent = subMonths(aujourdhui, 1);
        return {
          debut: startOfMonth(moisPrecedent),
          fin: endOfMonth(moisPrecedent),
        };
      case "annee_en_cours":
        return {
          debut: new Date(aujourdhui.getFullYear(), 0, 1),
          fin: endOfMonth(aujourdhui),
        };
      case "personnalisee":
        return {
          debut: parseISO(dateDebut),
          fin: parseISO(dateFin),
        };
      default:
        return {
          debut: startOfMonth(aujourdhui),
          fin: endOfMonth(aujourdhui),
        };
    }
  }, [periodeFilter, dateDebut, dateFin]);

  // Filtrage des factures
  const facturesFiltrees = useMemo(() => {
    let filtered = factures.filter((f) => {
      const dateFacture = parseISO(f.date);
      const inPeriode =
        !isBefore(dateFacture, periodeDates.debut) &&
        !isAfter(dateFacture, periodeDates.fin);
      const matchesType =
        typeClientFilter === "all" || f.clientType === typeClientFilter;
      const matchesVehicule =
        !vehiculeFilter ||
        f.vehiculeImmat?.toLowerCase().includes(vehiculeFilter.toLowerCase()) ||
        f.vehiculeMarque?.toLowerCase().includes(vehiculeFilter.toLowerCase());
      const matchesRetard = !showFacturesEnRetard || isFactureEnRetard(f);
      
      // Filtre par type de prestation si sélectionné
      const matchesPrestation = !selectedPrestationType || f.lignes.some((ligne) => {
        if (ligne.type !== "prestation") return false;
        const designation = ligne.designation.toLowerCase();
        const type =
          designation.includes("vidange") || designation.includes("révision")
            ? "Entretien"
            : designation.includes("frein") || designation.includes("plaquette")
            ? "Freinage"
            : designation.includes("pneu") || designation.includes("roue")
            ? "Pneus"
            : designation.includes("embrayage") || designation.includes("courroie")
            ? "Embrayage"
            : "Autres";
        return type === selectedPrestationType;
      });

      return inPeriode && matchesType && matchesVehicule && matchesRetard && matchesPrestation;
    });

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortFacturesBy === "date") {
        comparison =
          parseISO(a.date).getTime() - parseISO(b.date).getTime();
      } else if (sortFacturesBy === "montant") {
        comparison = a.montantTTC - b.montantTTC;
      } else if (sortFacturesBy === "statut") {
        comparison = a.statutPaiement.localeCompare(b.statutPaiement);
      }
      return sortFacturesOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    factures,
    periodeDates,
    typeClientFilter,
    vehiculeFilter,
    showFacturesEnRetard,
    sortFacturesBy,
    sortFacturesOrder,
    selectedPrestationType,
  ]);

  const isFactureEnRetard = (facture: Facture) => {
    if (facture.statutPaiement === "payée") return false;
    if (!facture.dateEcheance) return false;
    return isBefore(parseISO(facture.dateEcheance), new Date());
  };

  // Calculs des KPIs
  const caFacture = useMemo(() => {
    return facturesFiltrees.reduce((sum, f) => sum + f.montantTTC, 0);
  }, [facturesFiltrees]);

  const caEncaisse = useMemo(() => {
    return facturesFiltrees
      .filter((f) => f.statutPaiement === "payée")
      .reduce((sum, f) => sum + f.montantTTC, 0);
  }, [facturesFiltrees]);

  const caEnRetard = useMemo(() => {
    return facturesFiltrees
      .filter((f) => isFactureEnRetard(f))
      .reduce((sum, f) => sum + f.montantTTC, 0);
  }, [facturesFiltrees]);

  const caEnAttente = useMemo(() => {
    return facturesFiltrees
      .filter((f) => f.statutPaiement !== "payée" && !isFactureEnRetard(f))
      .reduce((sum, f) => sum + f.montantTTC, 0);
  }, [facturesFiltrees]);

  // Top 5 factures en retard
  const topFacturesEnRetard = useMemo(() => {
    return facturesFiltrees
      .filter((f) => isFactureEnRetard(f))
      .sort((a, b) => b.montantTTC - a.montantTTC)
      .slice(0, 5);
  }, [facturesFiltrees]);

  // Top 5 devis acceptés non facturés
  const topDevisAcceptes = useMemo(() => {
    return devisAcceptes
      .filter((d) => {
        const dateDevis = parseISO(d.date);
        const inPeriode =
          !isBefore(dateDevis, periodeDates.debut) &&
          !isAfter(dateDevis, periodeDates.fin);
        const matchesType =
          typeClientFilter === "all" || d.clientType === typeClientFilter;
        return inPeriode && matchesType;
      })
      .sort((a, b) => b.montantTTC - a.montantTTC)
      .slice(0, 5);
  }, [devisAcceptes, periodeDates, typeClientFilter]);

  const montantDevisAcceptes = useMemo(() => {
    const devisFiltres = devisAcceptes.filter((d) => {
      const dateDevis = parseISO(d.date);
      const inPeriode =
        !isBefore(dateDevis, periodeDates.debut) &&
        !isAfter(dateDevis, periodeDates.fin);
      const matchesType =
        typeClientFilter === "all" || d.clientType === typeClientFilter;
      const matchesVehicule =
        !vehiculeFilter ||
        d.vehiculeImmat?.toLowerCase().includes(vehiculeFilter.toLowerCase()) ||
        d.vehiculeMarque?.toLowerCase().includes(vehiculeFilter.toLowerCase());

      return inPeriode && matchesType && matchesVehicule;
    });
    return devisFiltres.reduce((sum, d) => sum + d.montantTTC, 0);
  }, [devisAcceptes, periodeDates, typeClientFilter, vehiculeFilter]);

  const nbFacturesEnRetard = useMemo(() => {
    return facturesFiltrees.filter(isFactureEnRetard).length;
  }, [facturesFiltrees]);

  // Données pour le graphique CA par mois (12 derniers mois)
  const caParMois = useMemo(() => {
    const mois = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const moisDebut = startOfMonth(date);
      const moisFin = endOfMonth(date);
      const caMois = factures
        .filter((f) => {
          const dateFacture = parseISO(f.date);
          return (
            !isBefore(dateFacture, moisDebut) &&
            !isAfter(dateFacture, moisFin) &&
            f.statutPaiement === "payée"
          );
        })
        .reduce((sum, f) => sum + f.montantTTC, 0);
      mois.push({
        mois: format(date, "MMM yyyy", { locale: fr }),
        ca: caMois,
      });
    }
    return mois;
  }, [factures]);

  // Répartition CA par type de prestation
  const caParPrestation = useMemo(() => {
    const repartition: { [key: string]: number } = {};
    facturesFiltrees
      .filter((f) => f.statutPaiement === "payée")
      .forEach((f) => {
        f.lignes.forEach((ligne) => {
          if (ligne.type === "prestation") {
            const designation = ligne.designation;
            // Regrouper par type (simplifié ici, on pourrait avoir une logique plus fine)
            const type =
              designation.toLowerCase().includes("vidange") ||
              designation.toLowerCase().includes("révision")
                ? "Entretien"
                : designation.toLowerCase().includes("frein") ||
                  designation.toLowerCase().includes("plaquette")
                ? "Freinage"
                : designation.toLowerCase().includes("pneu") ||
                  designation.toLowerCase().includes("roue")
                ? "Pneus"
                : designation.toLowerCase().includes("embrayage") ||
                  designation.toLowerCase().includes("courroie")
                ? "Embrayage"
                : "Autres";
            repartition[type] = (repartition[type] || 0) + 1;
          }
        });
      });

    // Calculer les montants (simplifié, en réalité il faudrait avoir les montants par ligne)
    const facturesPayees = facturesFiltrees.filter((f) => f.statutPaiement === "payée");
    const montantMoyenParFacture =
      facturesPayees.length > 0
        ? facturesPayees.reduce((sum, f) => sum + f.montantTTC, 0) /
          facturesPayees.length
        : 0;

    return Object.entries(repartition).map(([name, count]) => ({
      name,
      value: Math.round(count * montantMoyenParFacture),
      count,
    }));
  }, [facturesFiltrees]);

  const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#8b5cf6", "#ec4899", "#14b8a6"];

  const handleCreateFactureFromDevis = (devis: Devis) => {
    navigate(`/factures?devis=${devis.id}&numero=${devis.numero}`);
  };

  const getStatutPaiementBadge = (statut: Facture["statutPaiement"], dateEcheance?: string) => {
    const isRetard = dateEcheance && isBefore(parseISO(dateEcheance), new Date());
    switch (statut) {
      case "payée":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Payée</Badge>;
      case "en_attente":
        return isRetard ? (
          <Badge className="bg-red-500/20 text-red-600 border-red-500/30">En retard</Badge>
        ) : (
          <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">En attente</Badge>
        );
      case "partielle":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Partielle</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  // Fonction pour exporter en CSV
  const handleExportCSV = () => {
    const csvContent = [
      ["N° Facture", "Date", "Client", "Montant TTC", "Statut paiement"],
      ...facturesFiltrees.map((f) => [
        f.numero,
        format(parseISO(f.date), "dd/MM/yyyy", { locale: fr }),
        f.clientNom,
        f.montantTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 }),
        f.statutPaiement === "payée" ? "Payée" : f.statutPaiement === "en_attente" ? "En attente" : "Partielle",
      ]),
    ]
      .map((row) => row.join(";"))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `factures_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-900">
        {/* Header */}
        <BlurFade inView>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                ANALYSE FINANCIÈRE
              </p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl text-gray-900">
                Rapport{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Financier
                </span>
              </h1>
            </div>
            <div className="flex gap-3">
              <Select value={periodeFilter} onValueChange={setPeriodeFilter}>
                <SelectTrigger className="w-[180px] bg-white border-blue-300/50 text-gray-900">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-200/50 text-gray-900">
                  <SelectItem value="ce_mois">Ce mois</SelectItem>
                  <SelectItem value="mois_precedent">Mois précédent</SelectItem>
                  <SelectItem value="annee_en_cours">Année en cours</SelectItem>
                  <SelectItem value="personnalisee">Plage de dates</SelectItem>
                </SelectContent>
              </Select>
              {periodeFilter === "personnalisee" && (
                <>
                  <Input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-[150px] bg-white border-blue-300/50 text-gray-900"
                  />
                  <Input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-[150px] bg-white border-blue-300/50 text-gray-900"
                  />
                </>
              )}
            </div>
          </div>
        </BlurFade>

        {/* Hero financier - 3 grosses cartes */}
        <BlurFade inView delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CA facturé */}
            <Card className="border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white text-gray-900 shadow-lg">
                <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Receipt className="h-6 w-6 text-blue-600" />
                      </div>
                  <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">
                    Période choisie
                  </Badge>
                    </div>
                <p className="text-sm text-gray-600 mb-1">CA facturé</p>
                <p className="text-3xl font-bold text-gray-900">
                  {caFacture.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {facturesFiltrees.length} facture{facturesFiltrees.length > 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            {/* CA encaissé */}
            <Card className="border border-green-200/50 bg-gradient-to-br from-green-50 to-white text-gray-900 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                    Payé
                  </Badge>
                  </div>
                <p className="text-sm text-gray-600 mb-1">CA encaissé</p>
                <p className="text-3xl font-bold text-gray-900">
                  {caEncaisse.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {facturesFiltrees.filter((f) => f.statutPaiement === "payée").length} facture{facturesFiltrees.filter((f) => f.statutPaiement === "payée").length > 1 ? "s" : ""} payée{facturesFiltrees.filter((f) => f.statutPaiement === "payée").length > 1 ? "s" : ""}
                </p>
                </CardContent>
              </Card>

            {/* CA en retard / en attente */}
            <Card className="border border-red-200/50 bg-gradient-to-br from-red-50 to-white text-gray-900 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
                  <Badge className="bg-red-500/20 text-red-700 border-red-500/30">
                    {caEnRetard > 0 ? "En retard" : "En attente"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">CA en retard / en attente</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(caEnRetard + caEnAttente).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {topFacturesEnRetard.length} en retard • {caEnAttente > 0 ? `${(caEnAttente / (caEnRetard + caEnAttente) * 100).toFixed(0)}%` : "0%"} en attente
                </p>
              </CardContent>
            </Card>
          </div>
        </BlurFade>


        {/* Section 1 - Graph CA par mois */}
        <BlurFade inView delay={0.1}>
          <Card className="border border-blue-200/50 bg-white text-gray-900 shadow-lg">
              <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                CA par mois (12 derniers mois)
                </CardTitle>
              </CardHeader>
              <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={caParMois}>
                    <defs>
                      <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  <XAxis dataKey="mois" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "8px",
                      color: "#1e293b",
                      }}
                      formatter={(value: number) => `€ ${value.toLocaleString()}`}
                    />
                  <Area
                    type="monotone"
                    dataKey="ca"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCa)"
                  />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </BlurFade>

        {/* Section 2 - Répartition par type / activité */}
        <BlurFade inView delay={0.15}>
          <Card className="border border-blue-200/50 bg-white text-gray-900 shadow-lg">
              <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  Répartition par type / activité
                </CardTitle>
                {selectedPrestationType && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPrestationType(null)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Réinitialiser filtre
                  </Button>
                )}
              </div>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donut Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={caParPrestation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      onClick={(data) => setSelectedPrestationType(data.name)}
                    >
                      {caParPrestation.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          opacity={selectedPrestationType === null || selectedPrestationType === entry.name ? 1 : 0.3}
                          className="cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "8px",
                        color: "#1e293b",
                      }}
                      formatter={(value: number) => `€ ${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Barres horizontales */}
                <div className="space-y-3">
                  {caParPrestation
                    .sort((a, b) => b.value - a.value)
                    .map((item, index) => {
                      const total = caParPrestation.reduce((sum, i) => sum + i.value, 0);
                      const percentage = (item.value / total) * 100;
                      const isSelected = selectedPrestationType === item.name || selectedPrestationType === null;
                      return (
                        <div
                          key={item.name}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-300 bg-blue-50/50"
                              : "border-gray-200 bg-gray-50/30 opacity-50"
                          }`}
                          onClick={() => setSelectedPrestationType(item.name)}
                        >
                          <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-semibold text-sm text-gray-900">{item.name}</span>
                      </div>
                            <span className="font-bold text-gray-900">
                              € {item.value.toLocaleString()}
                            </span>
                    </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                </div>
                          <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% du CA</p>
        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Section 3 - Bloc Risque & opportunités */}
        <BlurFade inView delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Factures en retard */}
            <Card className="border border-red-200/50 bg-white text-gray-900 shadow-lg">
              <CardHeader className="pb-3 border-b border-red-200/50 bg-red-50/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Factures en retard
                </CardTitle>
                  <Badge className="bg-red-500/20 text-red-700 border-red-500/30">
                    {topFacturesEnRetard.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {topFacturesEnRetard.length > 0 ? (
                  <div className="space-y-2">
                    {topFacturesEnRetard.map((facture, index) => (
                      <div
                        key={facture.id}
                        className="group p-3 rounded-lg border border-red-200/50 bg-red-50/20 hover:bg-red-50/40 hover:border-red-300/50 transition-all cursor-pointer"
                        onClick={() => navigate(`/factures?numero=${facture.numero}`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge className="bg-red-500/20 text-red-700 border-red-500/30 text-xs shrink-0 w-6 h-6 flex items-center justify-center p-0">
                                {index + 1}
                        </Badge>
                              <span className="font-semibold text-sm text-gray-900 truncate">{facture.numero}</span>
                      </div>
                            <p className="text-xs font-medium text-gray-800 truncate mb-1">{facture.clientNom}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>{format(parseISO(facture.date), "d MMM yyyy", { locale: fr })}</span>
                              {facture.dateEcheance && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-red-600 font-semibold">
                                    Échéance: {format(parseISO(facture.dateEcheance), "d MMM", { locale: fr })}
                        </span>
                                </>
                              )}
                      </div>
                    </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
                              {facture.montantTTC.toLocaleString()} €
                            </span>
                            <span className="text-xs text-red-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Voir →
                      </span>
                    </div>
                  </div>
                </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune facture en retard</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Devis acceptés non facturés */}
            <Card className="border border-blue-200/50 bg-white text-gray-900 shadow-lg">
              <CardHeader className="pb-3 border-b border-blue-200/50 bg-blue-50/30">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Devis acceptés non facturés
                </CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">
                    {topDevisAcceptes.length}
                  </Badge>
                </div>
                {topDevisAcceptes.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total: <span className="font-semibold text-blue-700">
                      {topDevisAcceptes.reduce((sum, devis) => sum + devis.montantTTC, 0).toLocaleString()} €
                    </span>
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-4">
                {topDevisAcceptes.length > 0 ? (
                  <div className="space-y-2">
                    {topDevisAcceptes.map((devis, index) => (
                      <div
                        key={devis.id}
                        className="group p-3 rounded-lg border border-blue-200/50 bg-blue-50/20 hover:bg-blue-50/40 hover:border-blue-300/50 transition-all cursor-pointer relative"
                        onClick={() => handleCreateFactureFromDevis(devis)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30 text-xs shrink-0 w-6 h-6 flex items-center justify-center p-0">
                                {index + 1}
                        </Badge>
                              <span className="font-semibold text-sm text-gray-900 truncate">{devis.numero}</span>
                      </div>
                            <p className="text-xs font-medium text-gray-800 truncate mb-1">{devis.clientNom}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>{format(parseISO(devis.date), "d MMM yyyy", { locale: fr })}</span>
                              {devis.vehiculeImmat && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span>{devis.vehiculeImmat}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                              {devis.montantTTC.toLocaleString()} €
                        </span>
                            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="h-3 w-3" />
                              <span>Créer facture</span>
                            </div>
                          </div>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun devis accepté non facturé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </BlurFade>

        {/* Section 4 - Tableau exportable */}
        <BlurFade inView delay={0.25}>
          <Card className="border border-blue-200/50 bg-white text-gray-900 shadow-lg">
            <CardHeader className="pb-3 border-b border-blue-200/50 bg-blue-50/30">
                    <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-gray-900 mb-0.5">Factures sur la période</CardTitle>
                    {facturesFiltrees.length > 0 && (
                      <p className="text-xs text-gray-600">
                        {facturesFiltrees.length} facture{facturesFiltrees.length > 1 ? 's' : ''}
                        {facturesFiltrees.length > 10 && ` (10 affichées)`}
                      </p>
                    )}
                    </div>
                  </div>
                <Button
                  onClick={handleExportCSV}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
              {facturesFiltrees.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Receipt className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Aucune facture trouvée</p>
                  <p className="text-xs mt-1">Modifiez les filtres pour voir d'autres résultats</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-blue-200/50 bg-blue-50/20">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs">N° Facture</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs">Client</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-xs">Montant TTC</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facturesFiltrees.slice(0, 10).map((facture, index) => (
                          <tr
                            key={facture.id}
                            className="border-b border-blue-100/30 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                            onClick={() => navigate(`/factures?numero=${facture.numero}`)}
                          >
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {format(parseISO(facture.date), "d MMM yyyy", { locale: fr })}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-sm text-gray-900">{facture.numero}</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-[200px]">
                              {facture.clientNom}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                                {facture.montantTTC.toLocaleString()} €
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {getStatutPaiementBadge(facture.statutPaiement, facture.dateEcheance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {facturesFiltrees.length > 10 && (
                    <div className="p-4 bg-blue-50/20 border-t border-blue-200/50 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Affichage de <span className="font-semibold">10</span> factures sur{' '}
                        <span className="font-semibold">{facturesFiltrees.length}</span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCSV}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter toutes ({facturesFiltrees.length})
                      </Button>
                    </div>
                  )}
                </>
              )}
              </CardContent>
            </Card>
          </BlurFade>
      </div>
    </DashboardLayout>
  );
};

export default RapportFinancier;
