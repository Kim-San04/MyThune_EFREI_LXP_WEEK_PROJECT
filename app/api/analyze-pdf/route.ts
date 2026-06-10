import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL_PDF } from "@/lib/gemini-client";
import type { Budget, Category, Transaction, TxType } from "@/lib/types";

const VALID_TYPES: TxType[] = [
  "achat", "prelevement", "frais",
  "virement_emis", "virement_recu", "virement_interne", "transfert_international",
  "retrait", "remboursement",
];

const VALID_CATEGORIES: Category[] = [
  "alimentation", "transports", "abonnements", "sorties_loisirs", "sante",
  "achats_divers", "electricite_telecom", "transfert_international", "frais_bancaires",
  "retrait_especes", "remboursement", "autre",
];

const ALL_CATEGORIES: Category[] = [
  ...VALID_CATEGORIES,
  "revenus", "virements_emis", "virements_internes",
];

const PROMPT = `Tu es un expert-comptable spécialisé dans l'analyse de relevés bancaires français.
Le PDF joint est un relevé bancaire (BNP, Société Générale, Crédit Agricole, etc.).
Lis-le entièrement, y compris les libellés multi-lignes, et extrais TOUTES les opérations.

Réponds UNIQUEMENT avec un JSON (zéro markdown, zéro explication), de cette forme :
{"periodStart":"YYYY-MM-DD","periodEnd":"YYYY-MM-DD","transactions":[
  {"date":"DD/MM/YYYY","rawLabel":"libellé exact du relevé","cleanLabel":"nom normalisé","amount":-34.20,"type":"TYPE","category":"CAT","destinataire":null,"source":null}
]}

TYPE (un par opération) :
achat | prelevement | frais | virement_emis | virement_recu | virement_interne | transfert_international | retrait | remboursement

CATEGORY (uniquement pour type "achat" ou "prelevement", sinon mettre "autre") :
alimentation | transports | abonnements | sorties_loisirs | sante | achats_divers | electricite_telecom | frais_bancaires | retrait_especes | remboursement | autre

SIGNES : achat/prelevement/frais/virement_emis/retrait = NÉGATIF. virement_recu/remboursement/virement_interne = POSITIF. transfert_international = signe réel (peut être positif ou négatif).

RÈGLES DE TYPE :
- CAF/DRFIP/TRESOR PUBLIC/MES EXTRAS/EDUPASS/FRAIS DE SUBSISTANCE/virement reçu de l'étranger = virement_recu (revenus).
- VIR EMIS/VIR SCT INST EMIS/VIR EUROPEEN EMIS/VIR INSTANTANE EMIS/VIRT CPTE A CPTE EMIS/WERO avec destinataire/Lemfi = virement_emis.
- VIRT/VIR CPTE A CPTE RECU /DE [nom] : par défaut = virement_recu (revenu/don reçu, mets le nom dans "source"). Compare le nom après "/DE" avec le nom du TITULAIRE du compte écrit en en-tête du relevé (coordonnées du client) :
  - virement_interne UNIQUEMENT si le nom après "/DE" est EXACTEMENT le même nom (prénom + nom) que le titulaire du compte (transfert entre ses propres comptes).
  - Dans tous les autres cas (nom différent, ou titulaire non identifiable) → virement_recu.
- RETRAIT DAB = retrait (jamais "achat").
- Remboursements carte / rétrocession / avantage commercial = remboursement, montant POSITIF.
- Virements sortants vers LEMFI/NALA/WESTERN UNION/WISE/REMITLY/AFRICA KAFUMAWU = transfert_international.
- FRAIS VIR INTL/FRAIS HORS ZONE EURO/COMMISSION/FRAIS TENUE COMPTE/AGIOS/COTISATION = frais.

DESTINATAIRE / SOURCE :
- "destinataire" (nom de la personne) pour virement_emis et transfert_international.
- "source" (nom/origine) pour virement_recu et virement_interne.
- Si le libellé contient "/BEN NOM" ou "/BEN NOM/", extrais NOM (sans "BEN") dans destinataire ou source selon le type, et NE LE RÉPÈTE PAS dans cleanLabel.
- Si aucun nom n'est identifiable, mets null.

RÈGLES DE CATÉGORISATION (achat/prelevement uniquement) :
- alimentation : supermarchés (Lidl, Aldi, Carrefour, Leclerc, Intermarché, Monoprix, Auchan, Grand Frais, U Express), livraison de repas (Uber Eats, Deliveroo, Just Eat), restaurants, cafés, boulangeries.
- transports : RATP, SNCF, Ouigo, Navigo, TBM, Keolis, Heetch, Bolt, Dott, Flixbus, Uber (hors Eats).
- abonnements : Netflix, Spotify, Steam, Amazon Prime, Disney+, Google One, Claude.ai, OpenAI/ChatGPT, TryHackMe, Apple, Basic Fit, opérateurs mobile (Free, SFR, Orange, Bouygues) si abonnement type forfait.
- electricite_telecom : EDF, Engie, Ekwateur, Free Mobile, SFR, Orange, Bouygues, Iliad (factures énergie/télécom).
- achats_divers : Amazon (hors Prime), AliExpress, Gifi, Action, Normal, New Yorker, Zara, Fnac, Boulanger, vêtements/déco/électronique.
- sorties_loisirs : cinéma, bowling, bars, concerts, salle de sport (hors abonnement), soirées.
- sante : pharmacie, médecin, laboratoire, dentiste, opticien.
- frais_bancaires : agios, frais de tenue de compte, commissions, frais hors zone euro.
- autre : tout le reste, y compris PayPal/SumUp/Lydia si le marchand réel ne peut pas être déterminé.

NORMALISATION DU LIBELLÉ ("cleanLabel", 2-4 mots) :
Nettoie le libellé brut en un nom reconnaissable, ex: "LIDL 1816 PARIS" → "Lidl", "MC DO VALU SC" → "McDonald's", "UBER * EATS PENDING" → "Uber Eats", "NYX*CAFESSOUBIR" → "NYX Café".
Pour BNP, le vrai marchand est souvent après "DU DDMMYY". Pour SG, après "CARTE XXXX DD/MM".

Si tu ne trouves pas la période exacte du relevé, déduis-la de la plage de dates des opérations.
Ignore TOUTES les lignes qui ne sont PAS des opérations, notamment :
- "SOLDE CREDITEUR AU ...", "SOLDE DEBITEUR AU ...", "ANCIEN SOLDE", "NOUVEAU SOLDE", "SOLDE EN DATE DU ..." (soldes d'ouverture/clôture, ce ne sont jamais des transactions).
- Totaux/sous-totaux, mentions légales, en-têtes de colonnes, numéros de page, coordonnées du titulaire.`;

function sanitizeJsonString(s: string): string {
  let inString = false;
  let escaped = false;
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escaped) { out += ch; escaped = false; continue; }
    if (ch === "\\" && inString) { out += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; out += ch; continue; }
    if (inString && ch.charCodeAt(0) < 0x20) {
      out += ch === "\n" ? " " : ch === "\t" ? " " : "";
      continue;
    }
    out += ch;
  }
  return out;
}

function isoDate(raw: string): string | null {
  if (!raw) return null;
  // DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
  const m1 = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m1) {
    const year = m1[3].length === 2 ? `20${m1[3]}` : m1[3];
    return `${year}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return null;
}

function normalizeTransaction(raw: unknown, index: number): Transaction | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  // Handle both standard JSON floats ("31.65") and French locale strings ("1.234,56")
  const rawAmountStr = String(r.amount ?? "0");
  const parsedAmount = typeof r.amount === "number"
    ? r.amount
    : rawAmountStr.includes(",")
      ? parseFloat(rawAmountStr.replace(/\./g, "").replace(",", "."))
      : parseFloat(rawAmountStr);
  if (isNaN(parsedAmount) || parsedAmount === 0) return null;

  const date = isoDate(String(r.date ?? ""));
  if (!date) return null;

  const rawType = String(r.type ?? "");
  const type: TxType = (VALID_TYPES as string[]).includes(rawType)
    ? (rawType as TxType)
    : "achat";

  // Force correct sign based on type — don't trust Gemini's sign, only the absolute value.
  let amount: number;
  switch (type) {
    case "virement_recu":
    case "remboursement":
    case "virement_interne":
      // Entrée d'argent (ou mouvement interne) → toujours positif
      amount = Math.abs(parsedAmount);
      break;
    case "achat":
    case "prelevement":
    case "frais":
    case "virement_emis":
    case "retrait":
      // Sortie d'argent → toujours négatif
      amount = -Math.abs(parsedAmount);
      break;
    case "transfert_international":
      // Peut être entrant (positif) ou sortant (négatif) — on garde le signe de Gemini
      amount = parsedAmount;
      break;
    default:
      amount = parsedAmount;
  }

  // Force category from type for internal UI compat
  let category: Category;
  switch (type) {
    case "virement_emis":          category = "virements_emis"; break;
    case "virement_recu":          category = "revenus"; break;
    case "virement_interne":       category = "virements_internes"; break;
    case "transfert_international":category = "transfert_international"; break;
    case "retrait":                category = "retrait_especes"; break;
    case "remboursement":          category = "remboursement"; break;
    case "frais":                  category = "frais_bancaires"; break;
    default: {
      const rawCat = String(r.category ?? "");
      category = (VALID_CATEGORIES as string[]).includes(rawCat)
        ? (rawCat as Category)
        : "autre";
    }
  }

  const rawLabel = String(r.rawLabel ?? "").slice(0, 120).trim() || "—";
  const cleanLabel = String(r.cleanLabel ?? rawLabel).slice(0, 40).trim() || rawLabel.slice(0, 40);

  const dest = r.destinataire && r.destinataire !== "null"
    ? String(r.destinataire).slice(0, 60).trim()
    : undefined;
  const src = r.source && r.source !== "null"
    ? String(r.source).slice(0, 60).trim()
    : undefined;

  return {
    id: `tx-${index}-${date}-${Math.round(Math.abs(amount) * 100)}`,
    rawLabel,
    cleanLabel,
    amount,
    date,
    category,
    type,
    ...(dest ? { destinataire: dest } : {}),
    ...(src ? { source: src } : {}),
  };
}

function deriveMonth(transactions: Transaction[]): string {
  const dates = transactions.map((t) => t.date).filter(Boolean).sort();
  const ref = dates[Math.floor(dates.length / 2)] ?? new Date().toISOString().slice(0, 10);
  return ref.slice(0, 7);
}

function buildBudget(transactions: Transaction[], period?: { start: string; end: string }): Budget {
  const byCategory = ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = { total: 0, transactions: [] };
    return acc;
  }, {} as Budget["byCategory"]);

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalTransfers = 0;

  for (const tx of transactions) {
    byCategory[tx.category].transactions.push(tx);
    byCategory[tx.category].total += Math.abs(tx.amount);

    switch (tx.type) {
      case "virement_recu":
        if (tx.amount > 0) totalIncome += tx.amount;
        break;
      case "virement_emis":
      case "transfert_international":
        totalTransfers += Math.abs(tx.amount);
        break;
      case "achat":
      case "prelevement":
      case "frais":
        totalExpenses += Math.abs(tx.amount);
        break;
      // retrait and remboursement: informational only (byCategory only)
    }
  }

  // La période déclarée du relevé est plus fiable que les dates des transactions
  // effectivement extraites (Gemini peut en manquer certaines).
  const month = period ? period.end.slice(0, 7) : deriveMonth(transactions);
  return {
    transactions,
    totalIncome,
    totalExpenses,
    totalTransfers,
    remaining: totalIncome - totalExpenses - totalTransfers,
    byCategory,
    month,
    ...(period ? { periodStart: period.start, periodEnd: period.end } : {}),
    uploadedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Aucun fichier PDF reçu." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const model = getGeminiClient().getGenerativeModel({ model: GEMINI_MODEL_PDF });

    let text: string | null = null;
    let lastErr: unknown;
    const maxAttempts = 4;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [
              { inlineData: { mimeType: "application/pdf", data: base64 } },
              { text: PROMPT },
            ],
          }],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
            maxOutputTokens: 32768,
          },
        });
        text = result.response.text();
        break;
      } catch (err) {
        lastErr = err;
        const message = err instanceof Error ? err.message : "";
        // 503 (modèle surchargé) / 429 (quota) : transitoire, on retente avec backoff.
        const retryable = /503|429|overloaded|high demand/i.test(message);
        if (retryable && attempt < maxAttempts - 1) {
          console.error(`[analyze-pdf] Gemini ${message.match(/\d{3}/)?.[0] ?? "error"}, retry ${attempt + 1}/${maxAttempts - 1}`);
          await new Promise((resolve) => setTimeout(resolve, 5000 * (attempt + 1)));
          continue;
        }
        break;
      }
    }

    if (text === null) {
      console.error("[analyze-pdf] Gemini error:", lastErr);
      const message = lastErr instanceof Error ? lastErr.message : "";
      if (/API key/i.test(message)) {
        return NextResponse.json(
          { error: "Clé API Gemini invalide. Vérifie GEMINI_API_KEY dans .env.local (génère-en une sur aistudio.google.com/apikey)." },
          { status: 500 }
        );
      }
      if (/503|overloaded|high demand/i.test(message)) {
        return NextResponse.json(
          { error: "Le modèle Gemini est momentanément surchargé. Réessaie dans une minute." },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: "Erreur lors de l'analyse du PDF par Gemini." }, { status: 500 });
    }

    const cleaned = sanitizeJsonString(
      text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim()
    );

    let parsed: { periodStart?: string; periodEnd?: string; transactions?: unknown[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("[analyze-pdf] JSON parse error:", err);
      return NextResponse.json(
        {
          error:
            "Thunie n'a pas réussi à lire ce relevé. Essaie d'exporter ton PDF depuis l'appli de ta banque plutôt que de scanner un document papier.",
        },
        { status: 422 }
      );
    }

    const rawArray = Array.isArray(parsed.transactions) ? parsed.transactions : [];
    const transactions: Transaction[] = rawArray
      .map((item, i) => normalizeTransaction(item, i))
      .filter((tx): tx is Transaction => tx !== null);

    if (!transactions.length) {
      return NextResponse.json(
        {
          error:
            "Impossible de détecter des transactions dans ce PDF. Le format n'est peut-être pas reconnu.",
        },
        { status: 422 }
      );
    }

    const start = isoDate(String(parsed.periodStart ?? ""));
    const end = isoDate(String(parsed.periodEnd ?? ""));
    const period = start && end ? { start, end } : undefined;

    const budget = buildBudget(transactions, period);
    return NextResponse.json({ budget });
  } catch (err) {
    console.error("[analyze-pdf]", err);
    return NextResponse.json({ error: "Erreur lors de l'analyse du PDF." }, { status: 500 });
  }
}
