import {
  Banknote,
  Car,
  Globe2,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  type LucideIcon,
  Laptop,
  LifeBuoy,
  Package,
  PartyPopper,
  Plane,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  Send,
  Target,
  TrendingUp,
  Undo2,
  Zap,
} from "lucide-react";
import type { Category } from "@/lib/types";

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  alimentation: ShoppingCart,
  transports: Car,
  abonnements: Repeat,
  sorties_loisirs: PartyPopper,
  sante: HeartPulse,
  achats_divers: ShoppingBag,
  electricite_telecom: Zap,
  transfert_international: Globe2,
  frais_bancaires: Landmark,
  retrait_especes: Banknote,
  remboursement: Undo2,
  revenus: TrendingUp,
  virements_emis: Send,
  virements_internes: Repeat,
  autre: Package,
};

export const GOAL_ICON_OPTIONS: { key: string; icon: LucideIcon }[] = [
  { key: "target", icon: Target },
  { key: "plane", icon: Plane },
  { key: "home", icon: Home },
  { key: "car", icon: Car },
  { key: "laptop", icon: Laptop },
  { key: "graduation", icon: GraduationCap },
  { key: "party", icon: PartyPopper },
  { key: "lifebuoy", icon: LifeBuoy },
];

export const GOAL_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  GOAL_ICON_OPTIONS.map(({ key, icon }) => [key, icon])
);

export const DEFAULT_GOAL_ICON_KEY = "target";
