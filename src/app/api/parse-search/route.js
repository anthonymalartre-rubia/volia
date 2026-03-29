import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { trackApiCall } from '@/lib/apiCosts';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return NextResponse.json(
        { error: "Requête trop courte" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY non configurée" },
        { status: 500 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Tu es un assistant qui convertit des descriptions en langage naturel en termes de recherche Google Places pour la prospection B2B en France.

L'utilisateur décrit ce qu'il cherche. Extrais une liste de termes de recherche courts et précis, optimisés pour l'API Google Places Text Search en France.

Règles :
- Chaque terme doit être un type d'établissement ou un métier concret (ex: "restaurant italien", "salon de coiffure", "cabinet comptable")
- Pas de phrases, juste des termes de recherche courts
- Entre 1 et 15 termes maximum
- En français
- Ne répète pas les termes
- Si la demande est trop vague, propose les termes les plus pertinents

Réponds UNIQUEMENT avec un JSON array de strings, sans explication.
Exemple : ["restaurant italien", "pizzeria", "trattoria"]

Demande de l'utilisateur : "${query.trim()}"`,
        },
      ],
    });

    trackApiCall('anthropic', null, 'messages.create');

    const text = message.content[0]?.text || "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ terms: [query.trim()] });
    }

    const terms = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(terms) || terms.length === 0) {
      return NextResponse.json({ terms: [query.trim()] });
    }

    return NextResponse.json({
      terms: terms.filter((t) => typeof t === "string" && t.trim()).slice(0, 15),
    });
  } catch (error) {
    console.error("Parse search error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse de la recherche" },
      { status: 500 }
    );
  }
}
