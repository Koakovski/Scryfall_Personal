import { Card, CardLayout } from "../../services/scryfall-api/types/card";

// Layouts que possuem duas faces com imagens separadas
const DOUBLE_FACED_LAYOUTS: CardLayout[] = [
  "transform",
  "modal_dfc",
  "double_faced_token",
  "reversible_card",
  "art_series",
];

/**
 * Tipos principais de cartas do Magic: The Gathering
 * Ordem de prioridade para classificação (quando uma carta tem múltiplos tipos)
 */
export const CARD_TYPES = [
  "Creature",
  "Planeswalker",
  "Battle",
  "Artifact",
  "Enchantment",
  "Instant",
  "Sorcery",
  "Land",
] as const;

export type CardType = (typeof CARD_TYPES)[number] | "Other";

/**
 * Extrai o tipo principal de uma carta a partir do type_line
 */
export function extractMainCardType(typeLine?: string): CardType {
  if (!typeLine) return "Other";
  
  // Pega apenas a parte antes de " — " (subtipo)
  const mainTypePart = typeLine.split(" — ")[0].toUpperCase();
  
  // Verifica cada tipo na ordem de prioridade
  for (const cardType of CARD_TYPES) {
    if (mainTypePart.includes(cardType.toUpperCase())) {
      return cardType;
    }
  }
  
  return "Other";
}

export interface CardData {
  id: string;
  oracleId: string;
  name: string;
  setName: string;
  collectorNumber: string;
  imageUri: string;
  // Campos opcionais para cartas double-faced (compatibilidade retroativa)
  layout?: CardLayout;
  backImageUri?: string;
  // Linha de tipo da carta (ex: "Legendary Creature — Human Wizard")
  typeLine?: string;
}

export class CardEntity {
  private constructor(private readonly data: CardData) {}

  static new(card: Card): CardEntity {
    const { frontUri, backUri } = CardEntity.extractImageUris(card);
    const isDoubleFaced = DOUBLE_FACED_LAYOUTS.includes(card.layout);
    
    // Para cartas double-faced, usa o type_line da primeira face se não houver type_line global
    const typeLine = card.type_line ?? card.card_faces?.[0]?.type_line;

    return new CardEntity({
      id: card.id,
      oracleId: card.oracle_id,
      name: card.name,
      setName: card.set_name,
      collectorNumber: card.collector_number,
      imageUri: frontUri,
      layout: card.layout,
      backImageUri: isDoubleFaced ? backUri : undefined,
      typeLine,
    });
  }

  static fromData(data: CardData): CardEntity {
    return new CardEntity(data);
  }

  private static extractImageUris(card: Card): {
    frontUri: string;
    backUri: string | undefined;
  } {
    // Cartas normais têm image_uris diretamente
    if (card.image_uris?.normal) {
      return { frontUri: card.image_uris.normal, backUri: undefined };
    }

    // Cartas double-faced têm imagens nas faces
    if (card.card_faces && card.card_faces.length >= 2) {
      const frontUri =
        card.card_faces[0]?.image_uris?.normal ??
        "./assets/magic_card_back.png";
      const backUri = card.card_faces[1]?.image_uris?.normal;
      return { frontUri, backUri };
    }

    // Fallback para primeira face disponível
    const faceWithUri = card.card_faces?.find(
      (face) => face.image_uris?.normal
    );
    if (faceWithUri?.image_uris?.normal) {
      return { frontUri: faceWithUri.image_uris.normal, backUri: undefined };
    }

    return { frontUri: "./assets/magic_card_back.png", backUri: undefined };
  }

  get id(): string {
    return this.data.id;
  }

  get oracleId(): string {
    return this.data.oracleId;
  }

  get name(): string {
    return this.data.name;
  }

  get setName(): string {
    return this.data.setName;
  }

  get collectorNumber(): string {
    return this.data.collectorNumber;
  }

  get normalImageUri(): string {
    return this.data.imageUri;
  }

  get layout(): CardLayout | undefined {
    return this.data.layout;
  }

  get backImageUri(): string | undefined {
    return this.data.backImageUri;
  }

  /**
   * Retorna true se a carta tem duas faces com imagens separadas
   */
  get isDoubleFaced(): boolean {
    return !!this.data.backImageUri;
  }

  /**
   * Retorna a URL da arte da carta (art_crop do Scryfall)
   * Deriva da URL normal substituindo o tamanho
   */
  get artCropUri(): string {
    return this.data.imageUri.replace("/normal/", "/art_crop/");
  }

  /**
   * Retorna a linha de tipo completa da carta
   */
  get typeLine(): string | undefined {
    return this.data.typeLine;
  }

  /**
   * Retorna o tipo principal da carta (Creature, Land, etc.)
   */
  get mainType(): CardType {
    return extractMainCardType(this.data.typeLine);
  }

  toData(): CardData {
    return { ...this.data };
  }

  /**
   * Cria uma nova versão da carta, alterando id, imageUri, setName, collectorNumber,
   * layout, backImageUri e typeLine. Mantém o oracleId e name originais.
   */
  withVariation(newVersion: CardEntity): CardEntity {
    return new CardEntity({
      ...this.data,
      id: newVersion.id,
      imageUri: newVersion.normalImageUri,
      setName: newVersion.setName,
      collectorNumber: newVersion.collectorNumber,
      layout: newVersion.layout,
      backImageUri: newVersion.backImageUri,
      typeLine: newVersion.typeLine ?? this.data.typeLine,
    });
  }
}
