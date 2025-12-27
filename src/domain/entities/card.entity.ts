import { Card } from "../../services/scryfall-api/types/card";

export interface CardData {
  id: string;
  oracleId: string;
  name: string;
  setName: string;
  collectorNumber: string;
  imageUri: string;
}

export class CardEntity {
  private constructor(private readonly data: CardData) {}

  static new(card: Card): CardEntity {
    return new CardEntity({
      id: card.id,
      oracleId: card.oracle_id,
      name: card.name,
      setName: card.set_name,
      collectorNumber: card.collector_number,
      imageUri: CardEntity.extractImageUri(card),
    });
  }

  static fromData(data: CardData): CardEntity {
    return new CardEntity(data);
  }

  private static extractImageUri(card: Card): string {
    if (card.image_uris?.normal) {
      return card.image_uris.normal;
    }

    const faceWithUri = card.card_faces?.find(
      (face) => face.image_uris?.normal
    );
    if (faceWithUri?.image_uris?.normal) {
      return faceWithUri.image_uris.normal;
    }

    return "./assets/magic_card_back.png";
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

  toData(): CardData {
    return { ...this.data };
  }
}
