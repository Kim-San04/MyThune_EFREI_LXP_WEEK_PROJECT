export type TxType =
  | "achat"
  | "prelevement"
  | "frais"
  | "virement_emis"
  | "virement_recu"
  | "virement_interne"
  | "transfert_international"
  | "retrait"
  | "remboursement";

export type Category =
  | "alimentation"
  | "transports"
  | "abonnements"
  | "sorties_loisirs"
  | "sante"
  | "achats_divers"
  | "electricite_telecom"
  | "transfert_international"
  | "frais_bancaires"
  | "retrait_especes"
  | "remboursement"
  | "revenus"
  | "virements_emis"
  | "virements_internes"
  | "autre";

export interface Transaction {
  id: string;
  rawLabel: string;
  cleanLabel: string;
  amount: number;
  date: string;
  category: Category;
  type: TxType;
  destinataire?: string;
  source?: string;
}

export interface Budget {
  transactions: Transaction[];
  totalIncome: number;
  /** Real spending: achat + prelevement + frais. Excludes transfers and retraits. */
  totalExpenses: number;
  /** Transfers: virement_emis + transfert_international. Informative, not in totalExpenses. */
  totalTransfers: number;
  /** totalIncome − totalExpenses − totalTransfers */
  remaining: number;
  byCategory: Record<Category, { total: number; transactions: Transaction[] }>;
  month: string;
  /** Date de début de la période du relevé (ISO), si détectée dans le PDF */
  periodStart?: string;
  /** Date de fin de la période du relevé (ISO), si détectée dans le PDF */
  periodEnd?: string;
  uploadedAt: string;
}

export interface SavingsGoal {
  id: string;
  label: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
  color: string;
}

export interface ThunieMessage {
  role: "thunie" | "user";
  content: string;
  timestamp: string;
}

export type ThunieMode = "bienveillant" | "sarcastique";

export const CATEGORY_LABELS: Record<Category, string> = {
  alimentation: "Alimentation",
  transports: "Transports",
  abonnements: "Abonnements",
  sorties_loisirs: "Sorties & Loisirs",
  sante: "Santé",
  achats_divers: "Achats divers",
  electricite_telecom: "Électricité & Télécom",
  transfert_international: "Transferts internat.",
  frais_bancaires: "Frais bancaires",
  retrait_especes: "Retraits espèces",
  remboursement: "Remboursement",
  revenus: "Revenus",
  virements_emis: "Virements émis",
  virements_internes: "Virements internes",
  autre: "Autre",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  alimentation: "#F97316",
  transports: "#10B981",
  abonnements: "#F59E0B",
  sorties_loisirs: "#FB7185",
  sante: "#38BDF8",
  achats_divers: "#A855F7",
  electricite_telecom: "#8B5CF6",
  transfert_international: "#6366F1",
  frais_bancaires: "#0EA5E9",
  retrait_especes: "#94A3B8",
  remboursement: "#22D3EE",
  revenus: "#10B981",
  virements_emis: "#6366F1",
  virements_internes: "#78716C",
  autre: "#94A3B8",
};

