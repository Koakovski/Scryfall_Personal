import { CARD_TYPES, CardType } from "../../domain/entities/card.entity";
import { DeckCardEntity } from "../../domain/entities/deck-card.entity";
import { DeckEntity } from "../../domain/entities/deck.entity";

function formatCardLine(deckCard: DeckCardEntity): string {
  return `${deckCard.quantity} ${deckCard.cardName}`;
}

export function exportDeckAsList(deck: DeckEntity): string {
  const grouped = new Map<CardType, DeckCardEntity[]>();

  for (const type of [...CARD_TYPES, "Other" as const]) {
    grouped.set(type, []);
  }

  for (const deckCard of deck.cards) {
    grouped.get(deckCard.card.mainType)?.push(deckCard);
  }

  const sections: string[] = [];

  for (const cards of grouped.values()) {
    if (cards.length === 0) continue;
    sections.push(cards.map(formatCardLine).join("\n"));
  }

  return sections.join("\n\n");
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9\-_\s]/g, "").replace(/\s+/g, "-");
}

export function downloadDeckAsList(deck: DeckEntity): void {
  const text = exportDeckAsList(deck);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(deck.name)}-${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyDeckAsList(deck: DeckEntity): Promise<void> {
  await navigator.clipboard.writeText(exportDeckAsList(deck));
}
