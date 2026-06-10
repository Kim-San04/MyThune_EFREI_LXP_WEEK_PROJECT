import { NextRequest } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini-client";
import { CATEGORY_LABELS } from "@/lib/types";
import type { Budget, ThunieMessage, ThunieMode } from "@/lib/types";

const PERSONAS: Record<ThunieMode, string> = {
  bienveillant: `Tu es Thunie, un renard mascotte qui est coach budget bienveillant et chaleureux.
Tu encourages, tu félicites les efforts, tu relativises les écarts avec douceur et humour léger.
Tu tutoies, tu es proche d'un·e ami·e qui veut du bien. Emojis avec parcimonie (1-2 max par message).`,
  sarcastique: `Tu es Thunie, un renard mascotte qui est coach budget cash et un brin sarcastique (mais jamais méchant).
Tu pointes les dérives avec un humour piquant et des punchlines, façon pote qui n'a pas la langue dans sa poche.
Tu tutoies, tu es direct, drôle, jamais blessant. Emojis avec parcimonie (1-2 max par message).`,
};

function buildContext(budget: Budget | null, subcategoryContext?: string): string {
  if (!budget) return "Aucune donnée financière n'est disponible pour le moment.";

  const topCategories = Object.entries(budget.byCategory)
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([cat, v]) => `${CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}: ${v.total.toFixed(2)}€`)
    .join(", ");

  let ctx = `Voici le budget de l'utilisateur pour ${budget.month} :
- Revenus totaux : ${budget.totalIncome.toFixed(2)}€
- Dépenses réelles (cartes + prélèvements + frais) : ${budget.totalExpenses.toFixed(2)}€
- Virements émis (vers autres comptes) : ${budget.totalTransfers.toFixed(2)}€
- Reste à vivre : ${budget.remaining.toFixed(2)}€
- Top catégories de dépenses : ${topCategories || "aucune"}
- Nombre de transactions : ${budget.transactions.length}`;

  if (subcategoryContext) ctx += `\n${subcategoryContext}`;

  ctx += "\n\nUtilise ces chiffres pour répondre de façon précise et personnalisée. Ne les invente jamais, base-toi uniquement sur ces données.";
  return ctx;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ThunieMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const budget: Budget | null = body?.budget ?? null;
    const mode: ThunieMode = body?.mode === "sarcastique" ? "sarcastique" : "bienveillant";
    const subcategoryContext: string = typeof body?.subcategoryContext === "string" ? body.subcategoryContext.slice(0, 2000) : "";

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "Aucun message fourni." }), { status: 400 });
    }

    const systemPrompt = `${PERSONAS[mode]}

${buildContext(budget, subcategoryContext)}

Réponds en français, en 2 à 5 phrases maximum. Pas de markdown, pas de listes à puces, du texte naturel comme à l'oral.`;

    const model = getGeminiClient().getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: systemPrompt,
    });

    // Gemini exige que `contents` débute par le rôle "user" — on retire le message
    // d'accueil de Thunie (toujours en tête de l'historique côté client).
    const conversation = [...messages];
    while (conversation.length && conversation[0].role === "thunie") conversation.shift();

    const result = await model.generateContentStream({
      contents: conversation.map((m) => ({
        role: (m.role === "thunie" ? "model" : "user") as "model" | "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.8 },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const delta = chunk.text();
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch (err) {
          console.error("[thunie] stream error", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[thunie]", err);
    return new Response(JSON.stringify({ error: "Erreur lors de la génération de la réponse de Thunie." }), {
      status: 500,
    });
  }
}
