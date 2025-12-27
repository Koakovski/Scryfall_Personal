import { CardData, CardEntity } from "./card.entity";

export interface DeckCardData {
  card: CardData;
  quantity: number;
}

export class DeckCardEntity {
  private constructor(private readonly data: DeckCardData) {}

  static new(card: CardEntity, quantity: number = 1): DeckCardEntity {
    return new DeckCardEntity({
      card: card.toData(),
      quantity,
    });
  }

  static fromData(data: DeckCardData): DeckCardEntity {
    return new DeckCardEntity(data);
  }

  get card(): CardEntity {
    return CardEntity.fromData(this.data.card);
  }

  get quantity(): number {
    return this.data.quantity;
  }

  get cardId(): string {
    return this.data.card.id;
  }

  get cardName(): string {
    return this.data.card.name;
  }

  increaseQuantity(amount: number = 1): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      quantity: this.data.quantity + amount,
    });
  }

  decreaseQuantity(amount: number = 1): DeckCardEntity {
    const newQuantity = Math.max(0, this.data.quantity - amount);
    return new DeckCardEntity({
      ...this.data,
      quantity: newQuantity,
    });
  }

  setQuantity(quantity: number): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      quantity: Math.max(0, quantity),
    });
  }

  /**
   * Atualiza a versão da carta (arte diferente) mantendo a quantidade
   */
  withCardVariation(newCard: CardEntity): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      card: this.card.withVariation(newCard).toData(),
    });
  }

  toData(): DeckCardData {
    return {
      card: { ...this.data.card },
      quantity: this.data.quantity,
    };
  }
}

