import { Card } from "../../services/scryfall-api/types/card";

export class CardEntity {
  private constructor(private readonly card: Card) {}

  static new(card: Card) {
    return new CardEntity(card);
  }

  get id() {
    return this.card.id;
  }

  get name() {
    return this.card.name;
  }

  get setName() {
    return this.card.set_name;
  }

  get collectorNumber() {
    return this.card.collector_number;
  }

  get normalImageUri() {
    let uri = "./assets/magic_card_back.png";
    if (this.card.card_faces && this.card.card_faces.length > 0) {
      const faceWithUri = this.card.card_faces.find(
        (face) => face.image_uris?.normal
      );
      if (faceWithUri) {
        uri = faceWithUri.image_uris!.normal;
      }
    }

    if (this.card.image_uris?.normal) {
      uri = this.card.image_uris.normal;
    }

    return uri;
  }
}
