import { Card, CardLayout } from "../../services/scryfall-api/types/card";

// Layouts que possuem duas faces com imagens separadas
const DOUBLE_FACED_LAYOUTS: CardLayout[] = [
  "transform",
  "modal_dfc",
  "double_faced_token",
  "reversible_card",
  "art_series",
];

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
}

export class CardEntity {
  private constructor(private readonly data: CardData) {}

  static new(card: Card): CardEntity {
    const { frontUri, backUri } = CardEntity.extractImageUris(card);
    const isDoubleFaced = DOUBLE_FACED_LAYOUTS.includes(card.layout);

    return new CardEntity({
      id: card.id,
      oracleId: card.oracle_id,
      name: card.name,
      setName: card.set_name,
      collectorNumber: card.collector_number,
      imageUri: frontUri,
      layout: card.layout,
      backImageUri: isDoubleFaced ? backUri : undefined,
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

  toData(): CardData {
    return { ...this.data };
  }

  /**
   * Cria uma nova versão da carta, alterando id, imageUri, setName, collectorNumber,
   * layout e backImageUri. Mantém o oracleId e name originais.
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
    });
  }
}
